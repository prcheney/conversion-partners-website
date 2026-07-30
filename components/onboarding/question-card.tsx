"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AssignPanel } from "./assign-panel"
import type { FlatQuestion, QuestionState } from "@/lib/onboarding/types"

function draftKey(slug: string, questionId: string) {
  return `cp-onboarding:${slug}:${questionId}`
}

const statusLabel: Record<string, string> = {
  answered: "You answered this",
  skipped: "You skipped this",
}

export function QuestionCard({
  slug,
  question,
  state,
  total,
  canGoBack,
  onSave,
  onSkip,
  onAssign,
  onBack,
}: {
  slug: string
  question: FlatQuestion
  state: QuestionState | undefined
  total: number
  canGoBack: boolean
  onSave: (body: string) => Promise<string | null>
  onSkip: () => Promise<string | null>
  onAssign: (name: string, email: string, note: string) => Promise<string | null>
  onBack: () => void
}) {
  const [value, setValue] = useState(state?.body ?? "")
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const restored = useRef(false)

  // Unsent typing survives a refresh or an accidental close. Read after mount
  // so the server-rendered markup and the first client render still agree.
  useEffect(() => {
    if (restored.current) return
    restored.current = true
    try {
      const saved = window.localStorage.getItem(draftKey(slug, question.id))
      if (saved && saved !== (state?.body ?? "")) setValue(saved)
    } catch {
      // Private browsing or storage disabled — drafts just don't persist.
    }
  }, [slug, question.id, state?.body])

  useEffect(() => {
    try {
      if (value) window.localStorage.setItem(draftKey(slug, question.id), value)
      else window.localStorage.removeItem(draftKey(slug, question.id))
    } catch {
      // Same as above; nothing to recover from.
    }
  }, [value, slug, question.id])

  function clearDraft() {
    try {
      window.localStorage.removeItem(draftKey(slug, question.id))
    } catch {
      // no-op
    }
  }

  async function run(action: () => Promise<string | null>) {
    setBusy(true)
    setError(null)
    const message = await action()
    if (message) {
      setError(message)
      setBusy(false)
    } else {
      clearDraft()
    }
  }

  const assignedNote = state?.assignedTo
  const previously = state?.status && statusLabel[state.status]

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">
          {question.sectionTitle}
        </p>
        <p className="text-sm text-muted-foreground">
          Question {question.overallIndex + 1} of {total}
        </p>
      </div>

      <h2 className="mt-4 text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-[1.75rem]">
        {question.prompt}
      </h2>

      {question.helper && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{question.helper}</p>
      )}

      {(previously || assignedNote) && (
        <div className="mt-4 space-y-1 text-sm text-muted-foreground">
          {previously && <p>{previously}. Editing it replaces your answer.</p>}
          {assignedNote && (
            <p>
              Sent to{" "}
              <span className="font-medium text-foreground">
                {assignedNote.name || assignedNote.email}
              </span>{" "}
              on{" "}
              {new Date(assignedNote.at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
              .
            </p>
          )}
        </div>
      )}

      <div className="mt-6">
        {question.type === "long" ? (
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={7}
            placeholder={question.placeholder ?? "Type as much or as little as you like"}
            className="text-base"
          />
        ) : (
          <Input
            type={question.type === "link" ? "url" : "text"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={question.placeholder}
            className="text-base"
          />
        )}
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      {!assigning && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button size="lg" disabled={busy} onClick={() => run(() => onSave(value))}>
            {busy ? "Saving..." : "Save and continue"}
          </Button>
          <Button variant="ghost" disabled={busy} onClick={() => run(onSkip)}>
            Skip this one
          </Button>
          <Button variant="ghost" disabled={busy} onClick={() => setAssigning(true)}>
            Ask a teammate
          </Button>
        </div>
      )}

      {assigning && (
        <AssignPanel
          onCancel={() => setAssigning(false)}
          onAssign={async (name, email, note) => {
            const message = await onAssign(name, email, note)
            if (!message) clearDraft()
            return message
          }}
        />
      )}

      {canGoBack && (
        <button
          type="button"
          onClick={onBack}
          disabled={busy}
          className="mt-8 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
        >
          Back to the previous question
        </button>
      )}
    </div>
  )
}
