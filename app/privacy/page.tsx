export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-2xl mx-auto space-y-8 text-foreground">
        <h1 className="text-3xl font-semibold">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: March 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-medium">Who We Are</h2>
          <p className="leading-relaxed text-muted-foreground">
            Conversion Partners Network LLC ("we," "us," or "our") provides digital marketing and lead
            generation services. You can reach us at{" "}
            <a href="mailto:hello@conversionpartners.net" className="underline">
              hello@conversionpartners.net
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium">Information We Collect</h2>
          <p className="leading-relaxed text-muted-foreground">
            When you fill out our contact form, we collect your name, email address, phone number (if
            provided), and message. We use this information solely to respond to your inquiry and, if
            you opt in, to send you SMS communications.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium">SMS Communications</h2>
          <p className="leading-relaxed text-muted-foreground">
            If you opt in to receive SMS messages, you consent to receive automated marketing and
            informational text messages from Conversion Partners Network LLC at the phone number you
            provided.
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm pl-2">
            <li>Message types: promotional updates, service information, appointment follow-ups.</li>
            <li>Message frequency may vary.</li>
            <li>Standard message and data rates may apply.</li>
            <li>Consent is not a condition of purchase.</li>
            <li>
              To opt out at any time, reply <strong>STOP</strong> to any message or email us at{" "}
              <a href="mailto:hello@conversionpartners.net" className="underline">
                hello@conversionpartners.net
              </a>
              .
            </li>
            <li>
              For help, reply <strong>HELP</strong> or contact us directly.
            </li>
          </ul>
          <p className="leading-relaxed text-muted-foreground">
            We do not share your phone number with third parties for their marketing purposes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium">How We Use Your Information</h2>
          <p className="leading-relaxed text-muted-foreground">
            We use your information to respond to inquiries, provide our services, and communicate with
            you as you have requested. We do not sell your personal information to third parties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium">Data Retention</h2>
          <p className="leading-relaxed text-muted-foreground">
            We retain contact information for as long as necessary to provide our services or as
            required by law. You may request deletion of your data at any time by contacting us.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium">Contact</h2>
          <p className="leading-relaxed text-muted-foreground">
            Questions about this policy? Email us at{" "}
            <a href="mailto:hello@conversionpartners.net" className="underline">
              hello@conversionpartners.net
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  )
}
