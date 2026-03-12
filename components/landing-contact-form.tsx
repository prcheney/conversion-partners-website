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
      <div className="max-w-md mx-auto text-center py-12">
        <p className="text-foreground text-lg">Thanks for reaching out. We'll be in touch soon.</p>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="max-w-md mx-auto space-y-5 text-left pt-4">
      <div className="space-y-5">
        <Input
          name="name"
          placeholder="Name"
          required
          className="h-12 px-4 bg-background border-muted-foreground/20 focus:border-foreground transition-colors"
        />
        <Input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="h-12 px-4 bg-background border-muted-foreground/20 focus:border-foreground transition-colors"
        />
        <Textarea
          name="message"
          placeholder="How can we help?"
          required
          rows={5}
          className="px-4 py-3 bg-background border-muted-foreground/20 focus:border-foreground transition-colors resize-none"
        />
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Button 
        type="submit" 
        className="w-full h-12 bg-black text-white hover:bg-black/90 font-medium" 
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  )
}
