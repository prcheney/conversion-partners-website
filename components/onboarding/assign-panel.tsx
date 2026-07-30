"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function AssignPanel({
  onCancel,
  onAssign,
}: {
  onCancel: () => void
  onAssign: (name: string, email: string, note: string) => Promise<string | null>
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const message = await onAssign(name, email, note)
    if (message) {
      setError(message)
      setBusy(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-lg border border-border bg-card p-5"
      aria-label="Ask a teammate this question"
    >
      <p className="text-sm font-medium text-foreground">Who should answer this one?</p>
      <p className="mt-1 text-sm text-muted-foreground">
        They'll get an email with just this question and a link to answer it. You'll move straight on
        to the next question.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="assign-name" className="mb-1.5 block text-sm font-medium text-foreground">
            Their name
          </label>
          <Input
            id="assign-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Optional"
          />
        </div>
        <div>
          <label htmlFor="assign-email" className="mb-1.5 block text-sm font-medium text-foreground">
            Their email
          </label>
          <Input
            id="assign-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="assign-note" className="mb-1.5 block text-sm font-medium text-foreground">
          Add a note
        </label>
        <Textarea
          id="assign-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Optional. Anything that helps them answer it."
        />
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? "Sending..." : "Send it to them"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
