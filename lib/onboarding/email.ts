import "server-only"

import { Resend } from "resend"
import type { Questionnaire } from "./types"

/**
 * Transactional mail for the onboarding flow, sent through Resend on the
 * already-verified mail.conversionpartners.net sending domain. Same pattern as
 * cjm-estimator's lib/notify.ts: no send is ever allowed to fail a user action,
 * because a bounced notification matters less than a lost answer.
 */

const FROM = "Conversion Partners <onboarding@mail.conversionpartners.net>"

/**
 * Everything interpolated into these emails is typed by a stranger on a public
 * URL. It all goes through here first.
 */
function esc(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/** Preserves the line breaks people type into a textarea. */
function escMultiline(value: string | null | undefined): string {
  return esc(value).replace(/\r?\n/g, "<br>")
}

async function send(input: {
  to: string[]
  subject: string
  html: string
  replyTo?: string
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn("[onboarding] RESEND_API_KEY not set — skipping email:", input.subject)
    return false
  }
  try {
    const { error } = await new Resend(key).emails.send({
      from: FROM,
      to: input.to,
      replyTo: input.replyTo,
      subject: input.subject,
      html: input.html,
    })
    if (error) {
      console.error("[onboarding] Email failed:", input.subject, error)
      return false
    }
    return true
  } catch (err) {
    console.error("[onboarding] Email threw:", input.subject, err)
    return false
  }
}

const shell = (body: string) => `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
            font-size:16px;line-height:1.6;color:#111111;max-width:560px;margin:0 auto;padding:24px">
  ${body}
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px">
  <p style="font-size:13px;color:#6b7280;margin:0">
    Conversion Partners Network &middot;
    <a href="mailto:hello@conversionpartners.net" style="color:#1e7b85">hello@conversionpartners.net</a>
  </p>
</div>`

const button = (href: string, label: string) => `
  <p style="margin:28px 0">
    <a href="${esc(href)}"
       style="background:#1e7b85;color:#ffffff;text-decoration:none;padding:12px 22px;
              border-radius:8px;display:inline-block;font-weight:600">${esc(label)}</a>
  </p>`

/** Sent when someone starts, so they can return from any device. */
export function sendResumeLink(input: {
  to: string
  name: string
  questionnaire: Questionnaire
  resumeUrl: string
}): Promise<boolean> {
  return send({
    to: [input.to],
    subject: `Your ${input.questionnaire.clientName} onboarding link`,
    replyTo: input.questionnaire.contact.email,
    html: shell(`
      <p>Hi ${esc(input.name)},</p>
      <p>Here's your link back into the ${esc(input.questionnaire.clientName)} onboarding questions.
         Your progress is saved, so you can stop and pick it up whenever suits you.</p>
      ${button(input.resumeUrl, "Continue where you left off")}
      <p style="font-size:14px;color:#6b7280">Keep this email if you'd like to come back later.
         Nothing here is required — answer what you can.</p>
    `),
  })
}

/** The hand-off: one question, one person, one link. */
export function sendAssignmentInvite(input: {
  to: string
  assigneeName: string | null
  fromName: string
  fromEmail: string
  questionnaire: Questionnaire
  prompt: string
  note: string | null
  url: string
}): Promise<boolean> {
  const greeting = input.assigneeName ? `Hi ${esc(input.assigneeName)},` : "Hi,"
  return send({
    to: [input.to],
    subject: `${input.fromName} has one question for you (${input.questionnaire.clientName})`,
    replyTo: input.fromEmail,
    html: shell(`
      <p>${greeting}</p>
      <p><strong>${esc(input.fromName)}</strong> is filling out onboarding questions for
         ${esc(input.questionnaire.clientName)} with Conversion Partners, and thought this one
         belonged with you:</p>
      <blockquote style="margin:20px 0;padding:14px 18px;background:#f8f8f8;
                         border-left:3px solid #1e7b85;border-radius:0 6px 6px 0">
        ${esc(input.prompt)}
      </blockquote>
      ${
        input.note
          ? `<p style="font-size:15px"><strong>${esc(input.fromName)} added:</strong><br>
               ${escMultiline(input.note)}</p>`
          : ""
      }
      ${button(input.url, "Answer this question")}
      <p style="font-size:14px;color:#6b7280">It's one question, and it takes as long as you want to
         give it. If it isn't yours to answer, you can say so on the same page.</p>
    `),
  })
}

/** Closes the loop for whoever handed the question off, and for us. */
export function sendAssignmentResult(input: {
  to: string[]
  assigneeLabel: string
  questionnaire: Questionnaire
  prompt: string
  status: "completed" | "declined"
  body: string | null
}): Promise<boolean> {
  const done = input.status === "completed"
  return send({
    to: input.to,
    subject: done
      ? `${input.assigneeLabel} answered a question (${input.questionnaire.clientName})`
      : `${input.assigneeLabel} passed on a question (${input.questionnaire.clientName})`,
    html: shell(`
      <p><strong>${esc(input.assigneeLabel)}</strong>
         ${done ? "answered" : "wasn't the right person for"} this question:</p>
      <blockquote style="margin:20px 0;padding:14px 18px;background:#f8f8f8;
                         border-left:3px solid #1e7b85;border-radius:0 6px 6px 0">
        ${esc(input.prompt)}
      </blockquote>
      ${
        done && input.body
          ? `<div style="margin:20px 0;padding:14px 18px;border:1px solid #e5e7eb;border-radius:8px">
               ${escMultiline(input.body)}
             </div>`
          : `<p style="color:#6b7280">The question is still open for someone else to pick up.</p>`
      }
    `),
  })
}

/** Fires once someone reaches the end of the runner. Our cue to export. */
export function sendCompletionNotice(input: {
  to: string[]
  respondentName: string
  respondentEmail: string
  questionnaire: Questionnaire
  answered: number
  skipped: number
  assigned: number
  total: number
}): Promise<boolean> {
  return send({
    to: input.to,
    subject: `${input.respondentName} finished the ${input.questionnaire.clientName} onboarding`,
    html: shell(`
      <p><strong>${esc(input.respondentName)}</strong>
         (${esc(input.respondentEmail)}) reached the end of the
         ${esc(input.questionnaire.clientName)} questionnaire.</p>
      <ul style="line-height:1.9">
        <li><strong>${input.answered}</strong> answered</li>
        <li><strong>${input.skipped}</strong> skipped</li>
        <li><strong>${input.assigned}</strong> handed to a teammate</li>
        <li>${input.total} questions total</li>
      </ul>
      <p style="font-size:14px;color:#6b7280">
        Run <code>node scripts/export-onboarding.mjs ${esc(input.questionnaire.slug)}</code>
        to pull everything into a Google Doc.
      </p>
    `),
  })
}

export function notifyRecipients(): string[] {
  return (process.env.ONBOARDING_NOTIFY_TO ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}
