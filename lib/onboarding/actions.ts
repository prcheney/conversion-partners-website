"use server"

import { cookies } from "next/headers"
import {
  closeAssignment,
  createAssignment,
  getAssignmentByToken,
  getOrCreateRespondent,
  getRespondentById,
  getRespondentByToken,
  isValidEmail,
  markAssignmentSent,
  recordEvent,
  getRespondentState,
  type Respondent,
} from "./db"
import {
  notifyRecipients,
  sendAssignmentInvite,
  sendAssignmentResult,
  sendCompletionNotice,
  sendResumeLink,
} from "./email"
import { findQuestion, getQuestionnaire } from "./registry"
import { SESSION_MAX_AGE, sessionCookieName } from "./session"
import type { QuestionState } from "./types"

/**
 * Session = an httpOnly cookie holding the respondent's resume token. There are
 * no passwords here; the questionnaire holds a client's marketing background,
 * not anything sensitive enough to justify making them create an account.
 */

export interface SessionSnapshot {
  respondent: { id: string; name: string; email: string; resumeToken: string }
  state: Record<string, QuestionState>
}

function publicRespondent(r: Respondent) {
  return { id: r.id, name: r.name, email: r.email, resumeToken: r.resume_token }
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.conversionpartners.net").replace(/\/$/, "")
}

async function setSessionCookie(slug: string, resumeToken: string) {
  const store = await cookies()
  store.set(sessionCookieName(slug), resumeToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
}

/** Resolve the current respondent from the cookie, or from a resume token in the URL. */
export async function loadSession(
  slug: string,
  resumeToken?: string,
): Promise<SessionSnapshot | null> {
  const store = await cookies()
  const value = resumeToken ?? store.get(sessionCookieName(slug))?.value
  if (!value) return null

  const respondent = await getRespondentByToken(slug, value)
  if (!respondent) return null

  return {
    respondent: publicRespondent(respondent),
    state: await getRespondentState(slug, respondent.id),
  }
}

export async function startSession(
  slug: string,
  name: string,
  email: string,
): Promise<{ ok: true; session: SessionSnapshot } | { ok: false; error: string }> {
  const cleanName = name.trim()
  const cleanEmail = email.trim()

  if (!cleanName) return { ok: false, error: "Please tell us your name." }
  if (!isValidEmail(cleanEmail)) return { ok: false, error: "That email doesn't look right." }

  const questionnaire = getQuestionnaire(slug)
  const { respondent, isNew } = await getOrCreateRespondent({
    slug,
    name: cleanName,
    email: cleanEmail,
  })

  await setSessionCookie(slug, respondent.resume_token)

  // Only on first start — returning visitors already have the link.
  if (isNew) {
    await sendResumeLink({
      to: respondent.email,
      name: respondent.name,
      questionnaire: questionnaire.config,
      resumeUrl: `${siteUrl()}${questionnaire.config.path}/resume?r=${respondent.resume_token}`,
    })
  }

  return {
    ok: true,
    session: {
      respondent: publicRespondent(respondent),
      state: await getRespondentState(slug, respondent.id),
    },
  }
}

async function requireRespondent(slug: string): Promise<Respondent | null> {
  const store = await cookies()
  const value = store.get(sessionCookieName(slug))?.value
  if (!value) return null
  return getRespondentByToken(slug, value)
}

export async function submitAnswer(
  slug: string,
  questionId: string,
  body: string,
): Promise<{ ok: boolean; error?: string }> {
  const respondent = await requireRespondent(slug)
  if (!respondent) return { ok: false, error: "Your session expired. Please start again." }
  if (!findQuestion(slug, questionId)) return { ok: false, error: "Unknown question." }

  const trimmed = body.trim()
  if (!trimmed) return { ok: false, error: "Write something, or use Skip." }
  if (trimmed.length > 20000) return { ok: false, error: "That answer is too long to save." }

  await recordEvent({ slug, questionId, respondentId: respondent.id, kind: "answered", body: trimmed })
  return { ok: true }
}

export async function skipQuestion(
  slug: string,
  questionId: string,
): Promise<{ ok: boolean; error?: string }> {
  const respondent = await requireRespondent(slug)
  if (!respondent) return { ok: false, error: "Your session expired. Please start again." }
  if (!findQuestion(slug, questionId)) return { ok: false, error: "Unknown question." }

  await recordEvent({ slug, questionId, respondentId: respondent.id, kind: "skipped" })
  return { ok: true }
}

export async function assignQuestion(
  slug: string,
  questionId: string,
  assigneeName: string,
  assigneeEmail: string,
  note: string,
): Promise<{ ok: true; assignedTo: QuestionState["assignedTo"] } | { ok: false; error: string }> {
  const respondent = await requireRespondent(slug)
  if (!respondent) return { ok: false, error: "Your session expired. Please start again." }

  const question = findQuestion(slug, questionId)
  if (!question) return { ok: false, error: "Unknown question." }

  const email = assigneeEmail.trim()
  if (!isValidEmail(email)) return { ok: false, error: "That email doesn't look right." }

  const assignment = await createAssignment({
    slug,
    questionId,
    respondentId: respondent.id,
    assigneeName: assigneeName.trim() || null,
    assigneeEmail: email,
    note: note.trim().slice(0, 2000) || null,
  })

  // Hourly cap. Deliberately worded as a pause rather than an accusation —
  // the person who trips it is far more likely to be organized than hostile.
  if (!assignment) {
    return {
      ok: false,
      error: "That's a lot of hand-offs in one go. Give it an hour and you can send more.",
    }
  }

  const questionnaire = getQuestionnaire(slug)
  const sent = await sendAssignmentInvite({
    to: assignment.assignee_email,
    assigneeName: assignment.assignee_name,
    fromName: respondent.name,
    fromEmail: respondent.email,
    questionnaire: questionnaire.config,
    prompt: question.prompt,
    note: assignment.note,
    url: `${siteUrl()}${questionnaire.config.path}/q/${assignment.token}`,
  })
  if (sent) await markAssignmentSent(assignment.id)

  return {
    ok: true,
    assignedTo: {
      name: assignment.assignee_name,
      email: assignment.assignee_email,
      at: new Date().toISOString(),
    },
  }
}

export async function finishQuestionnaire(
  slug: string,
  counts: { answered: number; skipped: number; assigned: number },
): Promise<{ ok: boolean }> {
  const respondent = await requireRespondent(slug)
  if (!respondent) return { ok: false }

  const questionnaire = getQuestionnaire(slug)
  const to = notifyRecipients()
  if (to.length) {
    await sendCompletionNotice({
      to,
      respondentName: respondent.name,
      respondentEmail: respondent.email,
      questionnaire: questionnaire.config,
      total: questionnaire.total,
      ...counts,
    })
  }
  return { ok: true }
}

/* ── Assignment recipients ───────────────────────────────────────────────── */

export async function submitAssignedAnswer(
  assignmentToken: string,
  body: string,
): Promise<{ ok: boolean; error?: string }> {
  const assignment = await getAssignmentByToken(assignmentToken)
  if (!assignment) return { ok: false, error: "This link is no longer valid." }

  const question = findQuestion(assignment.questionnaire_slug, assignment.question_id)
  if (!question) return { ok: false, error: "This question is no longer part of the questionnaire." }

  const trimmed = body.trim()
  if (!trimmed) return { ok: false, error: "Write something, or let us know it isn't yours to answer." }
  if (trimmed.length > 20000) return { ok: false, error: "That answer is too long to save." }

  // The assignee becomes a respondent in their own right, so their answer is
  // attributed to them by name in the export rather than to whoever asked.
  const { respondent } = await getOrCreateRespondent({
    slug: assignment.questionnaire_slug,
    name: assignment.assignee_name || assignment.assignee_email.split("@")[0],
    email: assignment.assignee_email,
  })

  await recordEvent({
    slug: assignment.questionnaire_slug,
    questionId: assignment.question_id,
    respondentId: respondent.id,
    kind: "answered",
    body: trimmed,
    viaAssignmentId: assignment.id,
  })
  await closeAssignment(assignment.id, "completed")

  const asker = await getRespondentById(assignment.assigned_by)
  const questionnaire = getQuestionnaire(assignment.questionnaire_slug)
  const to = [...new Set([...(asker ? [asker.email] : []), ...notifyRecipients()])]
  if (to.length) {
    await sendAssignmentResult({
      to,
      assigneeLabel: respondent.name,
      questionnaire: questionnaire.config,
      prompt: question.prompt,
      status: "completed",
      body: trimmed,
    })
  }

  return { ok: true }
}

export async function declineAssignment(
  assignmentToken: string,
): Promise<{ ok: boolean; error?: string }> {
  const assignment = await getAssignmentByToken(assignmentToken)
  if (!assignment) return { ok: false, error: "This link is no longer valid." }

  const question = findQuestion(assignment.questionnaire_slug, assignment.question_id)
  await closeAssignment(assignment.id, "declined")

  const asker = await getRespondentById(assignment.assigned_by)
  const questionnaire = getQuestionnaire(assignment.questionnaire_slug)
  const to = [...new Set([...(asker ? [asker.email] : []), ...notifyRecipients()])]
  if (to.length && question) {
    await sendAssignmentResult({
      to,
      assigneeLabel: assignment.assignee_name || assignment.assignee_email,
      questionnaire: questionnaire.config,
      prompt: question.prompt,
      status: "declined",
      body: null,
    })
  }

  return { ok: true }
}
