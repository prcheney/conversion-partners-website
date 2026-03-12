"use client"

import { Button } from "@/components/ui/button"
import { ContactFormModal } from "@/components/contact-form-modal"
import { useState } from "react"

export function CTAStripe() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-balance">Ready to boost your conversions?</h2>
          <p className="text-lg lg:text-xl mb-8 text-pretty opacity-90">
            Let's discuss how we can help you convert more visitors into customers.
          </p>
          <Button size="lg" variant="secondary" onClick={() => setIsModalOpen(true)} className="text-lg px-8 py-3">
            Get Started Today
          </Button>
        </div>
      </section>

      <ContactFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
