"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { sendContactEmail } from "@/app/actions/contact"

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [smsConsent, setSmsConsent] = useState(false)
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)

    formData.set("sms_consent", smsConsent ? "true" : "false")
    const result = await sendContactEmail(formData)

    setIsSubmitting(false)

    if (result.success) {
      setIsSubmitted(true)
    } else {
      setError(result.error || "Something went wrong. Please try again.")
    }
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form state when closing
      setTimeout(() => {
        setIsSubmitted(false)
        setError(null)
        setSmsConsent(false)
      }, 200)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
        >
          Get in Touch
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Send us a message</DialogTitle>
        </DialogHeader>

        {isSubmitted ? (
          <div className="text-center py-8">
            <p className="text-foreground text-lg">Thanks for reaching out. We'll be in touch soon.</p>
          </div>
        ) : (
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <Input
                name="name"
                placeholder="Name"
                required
                className="h-11 px-4 bg-background border-muted-foreground/20 focus:border-foreground transition-colors"
              />
              <Input
                name="email"
                type="email"
                placeholder="Email"
                required
                className="h-11 px-4 bg-background border-muted-foreground/20 focus:border-foreground transition-colors"
              />
              <Input
                name="phone"
                type="tel"
                placeholder="Phone (optional)"
                className="h-11 px-4 bg-background border-muted-foreground/20 focus:border-foreground transition-colors"
              />
              <Textarea
                name="message"
                placeholder="How can we help?"
                required
                rows={4}
                className="px-4 py-3 bg-background border-muted-foreground/20 focus:border-foreground transition-colors resize-none"
              />
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                By checking the box below, you agree to receive automated marketing text messages from
                Conversion Partners Network LLC at the phone number provided. Consent is not a condition of
                purchase. Msg & data rates may apply. Message frequency may vary. Reply STOP to unsubscribe
                at any time. See our{" "}
                <a href="/privacy" className="underline hover:text-foreground transition-colors">
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a href="/terms" className="underline hover:text-foreground transition-colors">
                  Terms and Conditions
                </a>
                .
              </p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsConsent}
                  onChange={(e) => setSmsConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border border-muted-foreground/40 accent-primary"
                />
                <span className="text-xs text-muted-foreground">
                  I agree to receive SMS messages from Conversion Partners Network LLC.
                </span>
              </label>
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button
              type="submit"
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
