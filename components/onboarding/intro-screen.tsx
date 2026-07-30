"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Questionnaire } from "@/lib/onboarding/types"

export function IntroScreen({
  config,
  total,
  onStart,
}: {
  config: Questionnaire
  total: number
  onStart: (name: string, email: string) => Promise<string | null>
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const message = await onStart(name, email)
    if (message) {
      setError(message)
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16 sm:py-24">
      <p className="text-sm font-medium uppercase tracking-wider text-primary">
        {config.clientName}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {config.intro.heading}
      </h1>

      <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
        {config.intro.body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-border bg-card p-5">
        <p className="text-sm font-medium text-foreground">
          {total} questions, and every one of them is optional
        </p>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Answer</span> the ones you know.
          </li>
          <li>
            <span className="font-medium text-foreground">Skip</span> anything you don't have. It
            stays open, and nobody chases you for it.
          </li>
          <li>
            <span className="font-medium text-foreground">Ask a teammate</span> when the answer lives
            with someone else. They get that one question by email.
          </li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-4">
        <div>
          <label htmlFor="ob-name" className="mb-1.5 block text-sm font-medium text-foreground">
            Your name
          </label>
          <Input
            id="ob-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </div>
        <div>
          <label htmlFor="ob-email" className="mb-1.5 block text-sm font-medium text-foreground">
            Your email
          </label>
          <Input
            id="ob-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            So your progress saves and you can come back to it. We'll send you a link back in.
          </p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" size="lg" disabled={busy} className="w-full sm:w-auto">
          {busy ? "Starting..." : "Start"}
        </Button>
      </form>
    </div>
  )
}
