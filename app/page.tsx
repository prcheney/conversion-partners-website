import { ContactForm } from "@/components/landing-contact-form"

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center space-y-8">
        <div className="flex justify-center">
          <img src="/images/cpn-logo.png" alt="Conversion Partners Network" className="h-24 w-auto" />
        </div>

        <div className="text-foreground text-lg leading-relaxed max-w-xl mx-auto">
          <p className="text-pretty">
            If you've found your way here, chances are you need help converting people into customers. To connect, just
            send us a quick note.
          </p>
        </div>

        <ContactForm />
      </div>
    </main>
  )
}
