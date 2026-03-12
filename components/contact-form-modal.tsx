"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface ContactFormModalProps {
  trigger: React.ReactNode
  title?: string
}

export function ContactFormModal({ trigger, title = "Let's Connect" }: ContactFormModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    challenges: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("https://jplcrm.vercel.app/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone || null,
          message: formData.challenges || null,
          source: "conversionpartners.net",
          account_slug: "conversion-partners",
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setFormData({ firstName: "", lastName: "", email: "", phone: "", challenges: "" })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">{title}</DialogTitle>
        </DialogHeader>
        {isSubmitted ? (
          <p className="text-center py-8 text-sm text-muted-foreground">Thanks — we'll be in touch soon.</p>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="bg-white border-border"
              />
            </div>
            <div>
              <Input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="bg-white border-border"
              />
            </div>
          </div>
          <div>
            <Input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="bg-white border-border"
            />
          </div>
          <div>
            <Input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
              className="bg-white border-border"
            />
          </div>
          <div>
            <Textarea
              name="challenges"
              placeholder="Tell us about your conversion challenges..."
              value={formData.challenges}
              onChange={handleChange}
              required
              rows={4}
              className="bg-white border-border resize-none"
            />
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">We'll respond within 1 business day.</p>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
