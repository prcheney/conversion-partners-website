"use server"

import { notifyRecipients, sendContactNotice } from "@/lib/onboarding/email"

/**
 * Until 2026-08-30 this posted to jplcrm's /api/leads. That CRM was abandoned and
 * its account row for this site is gone, so every submission was coming back 404
 * and the visitor was told to try again. Leads now go straight to the team inbox,
 * which is the only place they are recorded.
 */
export async function sendContactEmail(formData: FormData) {
  const name = (formData.get("name") as string | null)?.trim()
  const email = (formData.get("email") as string | null)?.trim()
  const phone = (formData.get("phone") as string | null)?.trim() || null
  const message = (formData.get("message") as string | null)?.trim() || null
  const smsConsent = formData.get("sms_consent") === "true"

  if (!name || !email) {
    return { success: false, error: "Name and email are required." }
  }

  const recipients = notifyRecipients()
  if (recipients.length === 0) {
    console.error("[contact] ONBOARDING_NOTIFY_TO is empty, dropping lead from:", email)
    return { success: false, error: "Submission failed. Please try again." }
  }

  const delivered = await sendContactNotice({
    to: recipients,
    name,
    email,
    phone,
    message,
    smsConsent,
  })

  if (!delivered) {
    return { success: false, error: "Submission failed. Please try again." }
  }

  return { success: true }
}
