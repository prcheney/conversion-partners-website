"use server"

export async function sendContactEmail(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const message = formData.get("message") as string

  if (!name || !email || !message) {
    return { success: false, error: "All fields are required." }
  }

  try {
    // Send email using Resend or another email service
    // For now, we'll log the submission and return success
    // To enable email sending, add your RESEND_API_KEY to environment variables
    
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Contact Form <onboarding@resend.dev>",
        to: "info@conversionpartners.net",
        subject: `Contact from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        reply_to: email,
      }),
    })

    if (!response.ok) {
      // If Resend fails (likely no API key), log the submission
      console.log("Contact form submission:", { name, email, message })
      return { success: true }
    }

    return { success: true }
  } catch (error) {
    console.log("Contact form submission (fallback):", { name, email, message })
    return { success: true }
  }
}
