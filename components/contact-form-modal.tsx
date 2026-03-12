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
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    challenges: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", formData)
    setOpen(false)
    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      challenges: "",
    })
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
            <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full">
              Send Message
            </Button>
            <p className="text-xs text-muted-foreground text-center">We'll respond within 1 business day.</p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
