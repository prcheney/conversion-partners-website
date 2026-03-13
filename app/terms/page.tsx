export default function TermsAndConditions() {
  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-2xl mx-auto space-y-8 text-foreground">
        <h1 className="text-3xl font-semibold">Terms and Conditions</h1>
        <p className="text-sm text-muted-foreground">Last updated: March 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-medium">1. Agreement to Terms</h2>
          <p className="leading-relaxed text-muted-foreground">
            By accessing or using any services provided by Conversion Partners Network LLC ("Company,"
            "we," "us," or "our"), including submitting information through our website at
            conversionpartners.net, you agree to be bound by these Terms and Conditions. If you do not
            agree, do not use our services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium">2. Services</h2>
          <p className="leading-relaxed text-muted-foreground">
            Conversion Partners Network LLC provides digital marketing and lead generation services,
            including Google Ads management, landing page development, and related consulting for local
            businesses. Service terms for individual clients are governed by separate agreements.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium">3. SMS and Text Message Communications</h2>
          <p className="leading-relaxed text-muted-foreground">
            By opting in to receive SMS communications from Conversion Partners Network LLC, you agree
            to the following terms:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm pl-2">
            <li>
              <strong>Consent:</strong> You expressly consent to receive automated marketing and
              informational text messages from Conversion Partners Network LLC at the mobile phone
              number you provided. Consent is not a condition of purchasing any goods or services.
            </li>
            <li>
              <strong>Message Types:</strong> Messages may include promotional offers, service
              updates, appointment follow-ups, lead response notifications, and general business
              communications.
            </li>
            <li>
              <strong>Frequency:</strong> Message frequency may vary based on your interactions with
              us and ongoing campaigns.
            </li>
            <li>
              <strong>Rates:</strong> Standard message and data rates may apply. Check with your
              mobile carrier for details.
            </li>
            <li>
              <strong>Opt-Out:</strong> You may opt out of SMS communications at any time by replying{" "}
              <strong>STOP</strong> to any message. After opting out, you will receive a single
              confirmation message and no further SMS will be sent. To re-subscribe, reply{" "}
              <strong>START</strong>.
            </li>
            <li>
              <strong>Help:</strong> For assistance, reply <strong>HELP</strong> to any message or
              contact us at{" "}
              <a href="mailto:hello@conversionpartners.net" className="underline">
                hello@conversionpartners.net
              </a>
              .
            </li>
            <li>
              <strong>Missed Call Text Back:</strong> If you place a call to one of our business
              numbers and your call goes unanswered, you may receive a single automated SMS in
              response to your attempted contact. This message will identify us, reference your
              missed call, and include opt-out instructions.
            </li>
            <li>
              <strong>Carrier Disclaimer:</strong> Carriers are not liable for delayed or undelivered
              messages.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium">4. Privacy</h2>
          <p className="leading-relaxed text-muted-foreground">
            Your use of our services is also governed by our{" "}
            <a href="/privacy" className="underline hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            , which is incorporated into these Terms by reference. We do not sell or share your
            personal information or phone number with third parties for their marketing purposes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium">5. Intellectual Property</h2>
          <p className="leading-relaxed text-muted-foreground">
            All content on this website, including text, graphics, logos, and design, is the property
            of Conversion Partners Network LLC and may not be reproduced without written permission.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium">6. Disclaimer of Warranties</h2>
          <p className="leading-relaxed text-muted-foreground">
            Our services are provided "as is" without warranties of any kind, either express or
            implied. We do not guarantee specific results from our marketing services. Results vary
            based on market conditions, client participation, and other factors outside our control.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium">7. Limitation of Liability</h2>
          <p className="leading-relaxed text-muted-foreground">
            To the fullest extent permitted by law, Conversion Partners Network LLC shall not be
            liable for any indirect, incidental, special, or consequential damages arising from your
            use of our services or website.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium">8. Governing Law</h2>
          <p className="leading-relaxed text-muted-foreground">
            These Terms are governed by the laws of the State of Florida, without regard to conflict
            of law principles.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium">9. Changes to These Terms</h2>
          <p className="leading-relaxed text-muted-foreground">
            We may update these Terms from time to time. Changes will be posted on this page with an
            updated date. Continued use of our services after any changes constitutes acceptance of
            the revised Terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium">10. Contact</h2>
          <p className="leading-relaxed text-muted-foreground">
            Questions about these Terms? Contact us at{" "}
            <a href="mailto:hello@conversionpartners.net" className="underline">
              hello@conversionpartners.net
            </a>{" "}
            or write to us at:
          </p>
          <p className="text-muted-foreground text-sm">
            Conversion Partners Network LLC
            <br />
            5255 Lourcey Rd
            <br />
            Jacksonville, FL 32257
          </p>
        </section>
      </div>
    </main>
  )
}
