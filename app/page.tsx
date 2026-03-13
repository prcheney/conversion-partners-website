import { ContactForm } from "@/components/landing-contact-form"

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-xl w-full flex flex-col items-center gap-10">
        <div className="flex justify-center">
          <img
            src="/images/cpn-logo.png"
            alt="Conversion Partners Network"
            className="h-20 w-auto"
          />
        </div>

        <p className="text-foreground text-lg leading-relaxed text-center text-pretty">
          If you've found your way here, chances are you need help converting people into customers.
          To connect, just send us a quick note or give us a call.
        </p>

        <div className="flex flex-col items-center gap-4">
          <ContactForm />
          <a 
            href="tel:+19046437642" 
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            (904) 643-7642
          </a>
        </div>
      </div>
    </main>
  )
}
