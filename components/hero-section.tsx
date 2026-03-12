"use client"

import { Button } from "@/components/ui/button"
import { ContactFormModal } from "@/components/contact-form-modal"

export function HeroSection() {
  return (
    <section id="home" className="py-24 lg:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl">
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            We help growth-driven companies convert more people into customers.
          </h1>
          <ContactFormModal
            trigger={
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg">
                Let's Talk
              </Button>
            }
            title="Let's Discuss Your Goals"
          />
        </div>
      </div>
    </section>
  )
}
