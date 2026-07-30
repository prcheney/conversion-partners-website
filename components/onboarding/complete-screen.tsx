"use client"

import { Button } from "@/components/ui/button"
import type { Questionnaire } from "@/lib/onboarding/types"

export function CompleteScreen({
  config,
  counts,
  total,
  resumeUrl,
  onReview,
}: {
  config: Questionnaire
  counts: { answered: number; skipped: number; assigned: number }
  total: number
  resumeUrl: string
  onReview: () => void
}) {
  const untouched = Math.max(0, total - counts.answered - counts.skipped - counts.assigned)

  return (
    <div>
      <p className="text-sm font-medium uppercase tracking-wider text-primary">
        {config.clientName}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
        That's the end of the questions
      </h2>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Everything you wrote is saved. {counts.answered > 0 ? "This is plenty to work with" : "You can come back and add more whenever you like"}
        {counts.assigned > 0 ? ", and we'll pick up the handed-off questions as they come back in." : "."}
      </p>

      <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Answered", value: counts.answered },
          { label: "Skipped", value: counts.skipped },
          { label: "Handed off", value: counts.assigned },
          { label: "Untouched", value: untouched },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
            <dt className="text-sm text-muted-foreground">{stat.label}</dt>
            <dd className="mt-1 text-2xl font-semibold text-foreground">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button size="lg" onClick={onReview}>
          Go back through them
        </Button>
      </div>

      <div className="mt-8 rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Coming back later</p>
        <p className="mt-1">
          Use this link, or the one we emailed you:{" "}
          <span className="break-all font-mono text-xs text-foreground">{resumeUrl}</span>
        </p>
        <p className="mt-3">
          Questions about any of this? Email{" "}
          <a href={`mailto:${config.contact.email}`} className="text-primary underline-offset-4 hover:underline">
            {config.contact.email}
          </a>
          .
        </p>
      </div>
    </div>
  )
}
