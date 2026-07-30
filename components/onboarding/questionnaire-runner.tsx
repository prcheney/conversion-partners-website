"use client"

import { useCallback, useMemo, useState } from "react"
import {
  assignQuestion,
  finishQuestionnaire,
  skipQuestion,
  startSession,
  submitAnswer,
  type SessionSnapshot,
} from "@/lib/onboarding/actions"
import type { FlatQuestion, Questionnaire, QuestionState } from "@/lib/onboarding/types"
import { CompleteScreen } from "./complete-screen"
import { IntroScreen } from "./intro-screen"
import { QuestionCard } from "./question-card"

/** Resume at the first question this person hasn't touched yet. */
function firstOpenIndex(questions: FlatQuestion[], state: Record<string, QuestionState>): number {
  const i = questions.findIndex((q) => !state[q.id])
  return i === -1 ? questions.length : i
}

export function QuestionnaireRunner({
  config,
  questions,
  initialSession,
  siteUrl,
}: {
  config: Questionnaire
  questions: FlatQuestion[]
  initialSession: SessionSnapshot | null
  siteUrl: string
}) {
  const [session, setSession] = useState<SessionSnapshot | null>(initialSession)
  const [index, setIndex] = useState(() =>
    initialSession ? firstOpenIndex(questions, initialSession.state) : 0,
  )

  const total = questions.length
  const state = session?.state ?? {}

  const counts = useMemo(() => {
    let answered = 0
    let skipped = 0
    let assigned = 0
    for (const q of questions) {
      const s = state[q.id]
      if (!s) continue
      if (s.status === "answered") answered++
      else if (s.status === "skipped") skipped++
      else if (s.status === "assigned") assigned++
    }
    return { answered, skipped, assigned }
  }, [questions, state])

  const touched = counts.answered + counts.skipped + counts.assigned

  const patchState = useCallback((questionId: string, patch: Partial<QuestionState>) => {
    setSession((prev) => {
      if (!prev) return prev
      const existing = prev.state[questionId] ?? {
        questionId,
        status: "untouched" as const,
        body: null,
        assignedTo: null,
      }
      return { ...prev, state: { ...prev.state, [questionId]: { ...existing, ...patch } } }
    })
  }, [])

  const advance = useCallback(() => setIndex((i) => i + 1), [])

  const handleStart = useCallback(
    async (name: string, email: string) => {
      const result = await startSession(config.slug, name, email)
      if (!result.ok) return result.error
      setSession(result.session)
      setIndex(firstOpenIndex(questions, result.session.state))
      return null
    },
    [config.slug, questions],
  )

  // Only fired when someone walks off the end, not when they merely have work left.
  const notifyIfFinished = useCallback(
    (next: { answered: number; skipped: number; assigned: number }) => {
      if (index + 1 >= total) void finishQuestionnaire(config.slug, next)
    },
    [config.slug, index, total],
  )

  if (!session) {
    return <IntroScreen config={config} total={total} onStart={handleStart} />
  }

  const done = index >= total

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
      <div className="mb-10">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{config.clientName} onboarding</span>
          <span>
            {touched} of {total} covered
          </span>
        </div>
        <div
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={touched}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label="Questionnaire progress"
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${total ? (touched / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {done ? (
        <CompleteScreen
          config={config}
          counts={counts}
          total={total}
          resumeUrl={`${siteUrl}${config.path}/resume?r=${session.respondent.resumeToken}`}
          onReview={() => setIndex(0)}
        />
      ) : (
        <QuestionCard
          key={questions[index].id}
          slug={config.slug}
          question={questions[index]}
          state={state[questions[index].id]}
          total={total}
          canGoBack={index > 0}
          onBack={() => setIndex((i) => Math.max(0, i - 1))}
          onSave={async (body) => {
            const result = await submitAnswer(config.slug, questions[index].id, body)
            if (!result.ok) return result.error ?? "Could not save that."
            patchState(questions[index].id, { status: "answered", body: body.trim() })
            notifyIfFinished({
              ...counts,
              answered: state[questions[index].id]?.status === "answered"
                ? counts.answered
                : counts.answered + 1,
            })
            advance()
            return null
          }}
          onSkip={async () => {
            const result = await skipQuestion(config.slug, questions[index].id)
            if (!result.ok) return result.error ?? "Could not skip that."
            patchState(questions[index].id, { status: "skipped", body: null })
            notifyIfFinished({
              ...counts,
              skipped: state[questions[index].id]?.status === "skipped"
                ? counts.skipped
                : counts.skipped + 1,
            })
            advance()
            return null
          }}
          onAssign={async (name, email, note) => {
            const result = await assignQuestion(config.slug, questions[index].id, name, email, note)
            if (!result.ok) return result.error
            patchState(questions[index].id, {
              status: "assigned",
              assignedTo: result.assignedTo,
            })
            notifyIfFinished({ ...counts, assigned: counts.assigned + 1 })
            advance()
            return null
          }}
        />
      )}
    </div>
  )
}
