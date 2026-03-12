"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { sendContactEmail } from "@/app/actions/contact"

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)

    const result = await sendContactEmail(formData)

    setIsSubmitting(false)

    if (result.success) {
      setIsSubmitted(true)
    } else {
      setError(result.error || "Something went wrong. Please try again.")
    }
  }

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto text-center py-8">
        <p className="text-foreground text-lg">Thanks for reaching out. We'll be in touch soon.</p>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="max-w-md mx-auto space-y-4 text-left">
      <div className="grid grid-cols-2 gap-4">
        <Input
          name="name"
          placeholder="Name"
          required
          className="bg-background"
        />
        <Input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="bg-background"
        />
      </div>
      <Textarea
        name="message"
        placeholder="How can we help?"
        required
        rows={4}
        className="bg-background resize-none"
      />
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  )
}
