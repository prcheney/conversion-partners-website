"use client"

import { Button } from "@/components/ui/button"
import { ContactFormModal } from "@/components/contact-form-modal"

export function CTASection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-8 text-balance">
            If you're ready to stop guessing and start making data-backed conversion decisions — let's connect.
          </h2>
          <ContactFormModal
            trigger={
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-4 text-xl">
                Schedule a Call
              </Button>
            }
            title="Ready to Improve Your Conversions?"
          />
        </div>
      </div>
    </section>
  )
}
