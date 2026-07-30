/**
 * Shape of a client onboarding questionnaire. The runner renders whatever
 * config it is handed, so a new client is a new file in ./questionnaires plus
 * a three-line route — no changes to the UI.
 */

export type QuestionType = "long" | "short" | "link"

export interface Question {
  /**
   * Stable across edits. Answers are keyed by this, so renaming an id orphans
   * every answer already collected for that question.
   */
  id: string
  prompt: string
  /** Optional clarification shown under the prompt in muted text. */
  helper?: string
  type: QuestionType
  placeholder?: string
}

export interface Section {
  id: string
  title: string
  questions: Question[]
}

export interface Questionnaire {
  /** Used as the storage key and in every table row. Never change it in place. */
  slug: string
  /** Public path this questionnaire is served at, e.g. "/onboarding-ces". */
  path: string
  clientName: string
  title: string
  /** Who the client should reply to if something is unclear. */
  contact: { name: string; email: string }
  intro: {
    heading: string
    body: string[]
  }
}

/** A question paired with the section it belongs to and its overall position. */
export interface FlatQuestion extends Question {
  sectionId: string
  sectionTitle: string
  /** 1-based position within its section. */
  indexInSection: number
  sectionSize: number
  /** 0-based position across the whole questionnaire. */
  overallIndex: number
}

/** What a given respondent has already done with a given question. */
export type QuestionStatus = "answered" | "skipped" | "assigned" | "untouched"

export interface QuestionState {
  questionId: string
  status: QuestionStatus
  body: string | null
  /** Present when this respondent handed the question to someone else. */
  assignedTo: { name: string | null; email: string; at: string } | null
}
