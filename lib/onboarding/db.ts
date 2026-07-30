import "server-only"

import { randomBytes } from "crypto"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { QuestionState } from "./types"

/**
 * Service-role Supabase client for the onboarding tables. Server-side only —
 * these tables have RLS on with no policies, so this key is the only way in.
 * Pattern lifted from jplcrm's lib/supabase/admin.ts.
 */
function db(): SupabaseClient {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Onboarding Supabase credentials are not configured")
  return createClient(url, key, { auth: { persistSession: false } })
}

export interface Respondent {
  id: string
  name: string
  email: string
  resume_token: string
}

export interface Assignment {
  id: string
  questionnaire_slug: string
  question_id: string
  assignee_name: string | null
  assignee_email: string
  note: string | null
  assigned_by: string
  token: string
  status: "pending" | "completed" | "declined"
}

function token(): string {
  return randomBytes(24).toString("base64url")
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Deliberately permissive — enough to stop typos and header injection, not to police valid addresses. */
export function isValidEmail(email: string): boolean {
  const value = email.trim()
  if (value.length > 254 || /[\s<>,;"]/.test(value)) return false
  return /^[^@]+@[^@.]+(\.[^@.]+)+$/.test(value)
}

/**
 * Look up a respondent by email, or create one. Identity is the email, so the
 * same person returning on a different device picks up where they left off.
 */
export async function getOrCreateRespondent(input: {
  slug: string
  name: string
  email: string
}): Promise<{ respondent: Respondent; isNew: boolean }> {
  const supabase = db()
  const email = normalizeEmail(input.email)

  const { data: existing } = await supabase
    .from("respondents")
    .select("id, name, email, resume_token")
    .eq("questionnaire_slug", input.slug)
    .ilike("email", email)
    .maybeSingle()

  if (existing) {
    await supabase
      .from("respondents")
      .update({ last_seen_at: new Date().toISOString(), name: input.name.trim() || existing.name })
      .eq("id", existing.id)
    return { respondent: existing as Respondent, isNew: false }
  }

  const { data, error } = await supabase
    .from("respondents")
    .insert({
      questionnaire_slug: input.slug,
      name: input.name.trim(),
      email,
      resume_token: token(),
    })
    .select("id, name, email, resume_token")
    .single()

  if (error || !data) throw new Error(`Could not create respondent: ${error?.message}`)
  return { respondent: data as Respondent, isNew: true }
}

export async function getRespondentByToken(
  slug: string,
  resumeToken: string,
): Promise<Respondent | null> {
  const { data } = await db()
    .from("respondents")
    .select("id, name, email, resume_token")
    .eq("questionnaire_slug", slug)
    .eq("resume_token", resumeToken)
    .maybeSingle()
  return (data as Respondent) ?? null
}

export async function getRespondentById(id: string): Promise<Respondent | null> {
  const { data } = await db()
    .from("respondents")
    .select("id, name, email, resume_token")
    .eq("id", id)
    .maybeSingle()
  return (data as Respondent) ?? null
}

/**
 * Record what a respondent did with a question. Upserted per person, so going
 * back and editing replaces their own entry and touches nobody else's.
 */
export async function recordEvent(input: {
  slug: string
  questionId: string
  respondentId: string
  kind: "answered" | "skipped"
  body?: string | null
  viaAssignmentId?: string | null
}): Promise<void> {
  const { error } = await db()
    .from("question_events")
    .upsert(
      {
        questionnaire_slug: input.slug,
        question_id: input.questionId,
        respondent_id: input.respondentId,
        kind: input.kind,
        body: input.kind === "answered" ? (input.body ?? "") : null,
        via_assignment_id: input.viaAssignmentId ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "questionnaire_slug,question_id,respondent_id" },
    )
  if (error) throw new Error(`Could not save answer: ${error.message}`)
}

/**
 * This respondent's own view of the questionnaire: what they answered, skipped,
 * or handed off. Other people's answers are intentionally not exposed here —
 * the runner is a personal path through a shared questionnaire.
 */
export async function getRespondentState(
  slug: string,
  respondentId: string,
): Promise<Record<string, QuestionState>> {
  const supabase = db()

  const [{ data: events }, { data: assignments }] = await Promise.all([
    supabase
      .from("question_events")
      .select("question_id, kind, body")
      .eq("questionnaire_slug", slug)
      .eq("respondent_id", respondentId),
    supabase
      .from("assignments")
      .select("question_id, assignee_name, assignee_email, created_at")
      .eq("questionnaire_slug", slug)
      .eq("assigned_by", respondentId)
      .order("created_at", { ascending: false }),
  ])

  const state: Record<string, QuestionState> = {}

  for (const row of assignments ?? []) {
    if (state[row.question_id]) continue
    state[row.question_id] = {
      questionId: row.question_id,
      status: "assigned",
      body: null,
      assignedTo: {
        name: row.assignee_name,
        email: row.assignee_email,
        at: row.created_at,
      },
    }
  }

  // An answer or skip from this person outranks a pending hand-off.
  for (const row of events ?? []) {
    state[row.question_id] = {
      questionId: row.question_id,
      status: row.kind,
      body: row.body,
      assignedTo: state[row.question_id]?.assignedTo ?? null,
    }
  }

  return state
}

const ASSIGNMENTS_PER_HOUR = 10

/**
 * Create a hand-off and return it, or return null if this respondent has hit
 * the hourly cap. /onboarding-ces is a public URL with an outbound email form
 * on it; the cap is what keeps it from being an open relay pointed at our
 * verified sending domain.
 */
export async function createAssignment(input: {
  slug: string
  questionId: string
  respondentId: string
  assigneeName: string | null
  assigneeEmail: string
  note: string | null
}): Promise<Assignment | null> {
  const supabase = db()
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  const { count } = await supabase
    .from("assignments")
    .select("id", { count: "exact", head: true })
    .eq("assigned_by", input.respondentId)
    .gte("created_at", since)

  if ((count ?? 0) >= ASSIGNMENTS_PER_HOUR) return null

  const { data, error } = await supabase
    .from("assignments")
    .insert({
      questionnaire_slug: input.slug,
      question_id: input.questionId,
      assignee_name: input.assigneeName,
      assignee_email: normalizeEmail(input.assigneeEmail),
      note: input.note,
      assigned_by: input.respondentId,
      token: token(),
    })
    .select("*")
    .single()

  if (error || !data) throw new Error(`Could not create assignment: ${error?.message}`)
  return data as Assignment
}

export async function markAssignmentSent(id: string): Promise<void> {
  await db().from("assignments").update({ email_sent_at: new Date().toISOString() }).eq("id", id)
}

export async function getAssignmentByToken(assignmentToken: string): Promise<Assignment | null> {
  const { data } = await db()
    .from("assignments")
    .select("*")
    .eq("token", assignmentToken)
    .maybeSingle()
  return (data as Assignment) ?? null
}

export async function closeAssignment(
  id: string,
  status: "completed" | "declined",
): Promise<void> {
  await db()
    .from("assignments")
    .update({ status, completed_at: new Date().toISOString() })
    .eq("id", id)
}

/** Everything collected for a questionnaire, for the Google Doc export. */
export async function getAllResults(slug: string) {
  const supabase = db()
  const [{ data: respondents }, { data: events }, { data: assignments }] = await Promise.all([
    supabase.from("respondents").select("*").eq("questionnaire_slug", slug),
    supabase
      .from("question_events")
      .select("*")
      .eq("questionnaire_slug", slug)
      .order("updated_at", { ascending: true }),
    supabase.from("assignments").select("*").eq("questionnaire_slug", slug),
  ])
  return {
    respondents: respondents ?? [],
    events: events ?? [],
    assignments: assignments ?? [],
  }
}
