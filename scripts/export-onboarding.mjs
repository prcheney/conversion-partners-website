#!/usr/bin/env node
/**
 * Pull everything collected for a questionnaire, print a progress summary, and
 * write it into a Google Doc.
 *
 *   node scripts/export-onboarding.mjs [slug] [--no-doc]
 *
 * Runs locally on purpose: it borrows the already-authenticated `gws` CLI
 * rather than needing a Google service account deployed alongside the site.
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */

import { execFile } from "node:child_process"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"
import { readFileSync } from "node:fs"

const run = promisify(execFile)
const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, "..")

const args = process.argv.slice(2)
const slug = args.find((a) => !a.startsWith("--")) ?? "ces-academy"
const makeDoc = !args.includes("--no-doc")

/* ── config ─────────────────────────────────────────────────────────────── */

// Node strips the type annotations; the config file's only import is a type
// import, so nothing else needs resolving.
const { CES_ACADEMY, CES_ACADEMY_SECTIONS } = await import(
  path.join(repoRoot, "lib/onboarding/questionnaires/ces-academy.ts")
)

const QUESTIONNAIRES = {
  "ces-academy": { config: CES_ACADEMY, sections: CES_ACADEMY_SECTIONS },
}

const questionnaire = QUESTIONNAIRES[slug]
if (!questionnaire) {
  console.error(`Unknown questionnaire "${slug}". Known: ${Object.keys(QUESTIONNAIRES).join(", ")}`)
  process.exit(1)
}

/* ── env ────────────────────────────────────────────────────────────────── */

function readEnv() {
  const env = { ...process.env }
  try {
    for (const line of readFileSync(path.join(repoRoot, ".env.local"), "utf8").split("\n")) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (match && !env[match[1]]) env[match[1]] = match[2].replace(/^"|"$/g, "")
    }
  } catch {
    // No .env.local — fall back to whatever is already exported.
  }
  return env
}

const env = readEnv()
const SUPABASE_URL = env.SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (checked .env.local).")
  process.exit(1)
}

async function select(table, query) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  })
  if (!response.ok) throw new Error(`${table}: ${response.status} ${await response.text()}`)
  return response.json()
}

/* ── fetch ──────────────────────────────────────────────────────────────── */

const [respondents, events, assignments] = await Promise.all([
  select("respondents", `select=*&questionnaire_slug=eq.${slug}`),
  select("question_events", `select=*&questionnaire_slug=eq.${slug}&order=updated_at.asc`),
  select("assignments", `select=*&questionnaire_slug=eq.${slug}&order=created_at.asc`),
])

const nameOf = new Map(respondents.map((r) => [r.id, r.name]))

const byQuestion = new Map()
for (const event of events) {
  if (!byQuestion.has(event.question_id)) byQuestion.set(event.question_id, [])
  byQuestion.get(event.question_id).push(event)
}

const assignedByQuestion = new Map()
for (const assignment of assignments) {
  if (!assignedByQuestion.has(assignment.question_id)) assignedByQuestion.set(assignment.question_id, [])
  assignedByQuestion.get(assignment.question_id).push(assignment)
}

/** One question's fate across everyone who touched it. */
function resolve(question) {
  const all = byQuestion.get(question.id) ?? []
  const answers = all.filter((e) => e.kind === "answered" && e.body?.trim())
  const skips = all.filter((e) => e.kind === "skipped")
  const pending = (assignedByQuestion.get(question.id) ?? []).filter((a) => a.status === "pending")
  return { answers, skips, pending }
}

/* ── terminal summary ───────────────────────────────────────────────────── */

const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" })
const today = fmt.format(new Date())

let answeredCount = 0
let openCount = 0

console.log(`\n${questionnaire.config.clientName} onboarding — ${today}`)
console.log(`${respondents.length} contributor(s): ${respondents.map((r) => r.name).join(", ") || "none yet"}\n`)

for (const section of questionnaire.sections) {
  const marks = section.questions.map((question) => {
    const { answers, skips, pending } = resolve(question)
    if (answers.length) {
      answeredCount++
      return "."
    }
    openCount++
    if (pending.length) return "~"
    if (skips.length) return "-"
    return "?"
  })
  console.log(`  ${section.title.padEnd(28)} ${marks.join("")}`)
}

console.log(`\n  . answered   ~ waiting on a teammate   - skipped   ? untouched`)
console.log(`  ${answeredCount} of ${answeredCount + openCount} questions have an answer\n`)

/* ── Google Doc ─────────────────────────────────────────────────────────── */

if (!makeDoc) process.exit(0)

const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

const paragraphs = (value) =>
  esc(value)
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, "<br>")}</p>`)
    .join("")

const parts = [
  `<h1>${esc(questionnaire.config.clientName)} — Onboarding Responses</h1>`,
  `<p><i>Exported ${esc(today)}. ${answeredCount} of ${answeredCount + openCount} questions answered.`,
  respondents.length ? ` Contributors: ${esc(respondents.map((r) => r.name).join(", "))}.` : "",
  `</i></p>`,
]

for (const section of questionnaire.sections) {
  parts.push(`<h2>${esc(section.title)}</h2>`)
  for (const question of section.questions) {
    const { answers, skips, pending } = resolve(question)
    parts.push(`<h3>${esc(question.prompt)}</h3>`)

    if (answers.length) {
      for (const answer of answers) {
        if (answers.length > 1 || answer.via_assignment_id) {
          parts.push(`<p><b>${esc(nameOf.get(answer.respondent_id) ?? "Unknown")}</b></p>`)
        }
        parts.push(paragraphs(answer.body))
      }
    } else if (pending.length) {
      const who = pending.map((a) => a.assignee_name || a.assignee_email).join(", ")
      parts.push(`<p><i>Waiting on ${esc(who)}.</i></p>`)
    } else if (skips.length) {
      const who = skips.map((s) => nameOf.get(s.respondent_id) ?? "Unknown").join(", ")
      parts.push(`<p><i>Skipped by ${esc(who)}.</i></p>`)
    } else {
      parts.push(`<p><i>Not answered.</i></p>`)
    }
  }
}

// gws resolves --upload relative to the CWD, so the file has to live under it.
const workdir = await mkdtemp(path.join(tmpdir(), "onboarding-export-"))
const htmlPath = path.join(workdir, "export.html")
await writeFile(htmlPath, `<html><body>${parts.join("\n")}</body></html>`, "utf8")

const { folderId, docName } = questionnaire.config.export

// Every Drive call needs these: the client folders live in a shared drive, and
// without them the API behaves as if the files don't exist.
const SHARED_DRIVE = { supportsAllDrives: true, includeItemsFromAllDrives: true }

const gws = async (args, cwd) => {
  const { stdout } = await run("gws", args, { cwd })
  return JSON.parse(stdout)
}

async function findExistingDoc() {
  const query = `'${folderId}' in parents and name = '${docName.replace(/'/g, "\\'")}' and trashed = false`
  const result = await gws([
    "drive",
    "files",
    "list",
    "--params",
    JSON.stringify({ q: query, fields: "files(id,name)", pageSize: 1, ...SHARED_DRIVE }),
  ])
  return result.files?.[0]?.id ?? null
}

try {
  const existing = await findExistingDoc()

  // Rewrite the same Doc when it's already there. One stable URL beats a folder
  // full of dated copies, and anyone who bookmarked it keeps seeing current data.
  const id = existing
    ? (
        await gws(
          [
            "drive",
            "files",
            "update",
            "--params",
            JSON.stringify({ fileId: existing, ...SHARED_DRIVE }),
            "--upload",
            "export.html",
            "--upload-content-type",
            "text/html",
          ],
          workdir,
        )
      ).id
    : (
        await gws(
          [
            "drive",
            "files",
            "create",
            "--params",
            JSON.stringify(SHARED_DRIVE),
            "--json",
            JSON.stringify({
              name: docName,
              parents: [folderId],
              mimeType: "application/vnd.google-apps.document",
            }),
            "--upload",
            "export.html",
            "--upload-content-type",
            "text/html",
          ],
          workdir,
        )
      ).id

  console.log(`  ${existing ? "Updated" : "Created"} "${docName}"`)
  console.log(`  https://docs.google.com/document/d/${id}/edit\n`)
} catch (err) {
  console.error("  Could not write the Google Doc:", err.stderr || err.message)
  console.error(`  The HTML is at ${htmlPath} if you want to upload it by hand.\n`)
  process.exitCode = 1
} finally {
  if (process.exitCode !== 1) await rm(workdir, { recursive: true, force: true })
}
