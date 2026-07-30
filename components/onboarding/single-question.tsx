"use client"

import { useState } from "react"
import { declineAssignment, submitAssignedAnswer } from "@/lib/onboarding/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { FlatQuestion, Questionnaire } from "@/lib/onboarding/types"

/**
 * What an assignee sees: the one question they were asked, and nothing else.
 * The token in the URL is scoped to this single question.
 */
export function SingleQuestion({
  token,
  config,
  question,
  askedBy,
  note,
  alreadyClosed,
}: {
  token: string
  config: Questionnaire
  question: FlatQuestion
  askedBy: string
  note: string | null
  alreadyClosed: boolean
}) {
  const [value, setValue] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [outcome, setOutcome] = useState<"completed" | "declined" | null>(
    alreadyClosed ? "completed" : null,
  )

  async function run(action: () => Promise<{ ok: boolean; error?: string }>, result: "completed" | "declined") {
    setBusy(true)
    setError(null)
    const response = await action()
    if (!response.ok) {
      setError(response.error ?? "Something went wrong. Try again in a moment.")
      setBusy(false)
      return
    }
    setOutcome(result)
  }

  if (outcome) {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-20">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">
          {config.clientName}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          {outcome === "completed" ? "Thank you" : "No problem"}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {outcome === "completed"
            ? `That's it. Your answer is saved, and we've let ${askedBy} know.`
            : `We've marked this one as not yours and let ${askedBy} know, so it can go to the right person.`}
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          If you'd like to weigh in on the rest of the onboarding questions, you can{" "}
          <a
            href={config.path}
            className="text-primary underline-offset-4 hover:underline"
          >
            work through the full set
          </a>
          . Entirely optional.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wider text-primary">
        {config.clientName}
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
        {askedBy} asked you one question
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        It's for the onboarding work {config.clientName} is doing with Conversion Partners. Just this
        one, and only if you have the answer.
      </p>

      <div className="mt-8 rounded-lg border-l-[3px] border-primary bg-card p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {question.sectionTitle}
        </p>
        <h2 className="mt-2 text-xl font-semibold leading-snug text-foreground">
          {question.prompt}
        </h2>
        {question.helper && (
          <p className="mt-2 text-sm text-muted-foreground">{question.helper}</p>
        )}
      </div>

      {note && (
        <div className="mt-4 rounded-lg border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Note from {askedBy}
          </p>
          <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground">{note}</p>
        </div>
      )}

      <div className="mt-6">
        {question.type === "long" ? (
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={8}
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

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          size="lg"
          disabled={busy}
          onClick={() => run(() => submitAssignedAnswer(token, value), "completed")}
        >
          {busy ? "Saving..." : "Submit answer"}
        </Button>
        <Button
          variant="ghost"
          disabled={busy}
          onClick={() => run(() => declineAssignment(token), "declined")}
        >
          I'm not the right person for this
        </Button>
      </div>
    </div>
  )
}
