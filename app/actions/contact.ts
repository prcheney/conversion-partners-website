"use server"

export async function sendContactEmail(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string | null

  if (!name || !email) {
    return { success: false, error: "Name and email are required." }
  }

  try {
    const response = await fetch("https://jplcrm.vercel.app/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone: phone || null,
        source: "conversionpartners.net",
        account_slug: "conversion-partners",
      }),
    })

    if (!response.ok) {
      return { success: false, error: "Submission failed. Please try again." }
    }

    return { success: true }
  } catch {
    return { success: false, error: "Submission failed. Please try again." }
  }
}
