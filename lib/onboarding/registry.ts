import type { FlatQuestion, Question, Questionnaire, Section } from "./types"
import { CES_ACADEMY, CES_ACADEMY_SECTIONS } from "./questionnaires/ces-academy"

export interface LoadedQuestionnaire {
  config: Questionnaire
  sections: Section[]
  /** Every question in order, carrying its section context and position. */
  flat: FlatQuestion[]
  total: number
}

/** Add a client here plus a route folder, and the whole flow works for them. */
const REGISTRY: Record<string, { config: Questionnaire; sections: Section[] }> = {
  [CES_ACADEMY.slug]: { config: CES_ACADEMY, sections: CES_ACADEMY_SECTIONS },
}

function flatten(sections: Section[]): FlatQuestion[] {
  const out: FlatQuestion[] = []
  for (const section of sections) {
    section.questions.forEach((q: Question, i) => {
      out.push({
        ...q,
        sectionId: section.id,
        sectionTitle: section.title,
        indexInSection: i + 1,
        sectionSize: section.questions.length,
        overallIndex: out.length,
      })
    })
  }
  return out
}

export function getQuestionnaire(slug: string): LoadedQuestionnaire {
  const entry = REGISTRY[slug]
  if (!entry) throw new Error(`Unknown questionnaire: ${slug}`)
  const flat = flatten(entry.sections)
  return { config: entry.config, sections: entry.sections, flat, total: flat.length }
}

export function findQuestion(slug: string, questionId: string): FlatQuestion | null {
  return getQuestionnaire(slug).flat.find((q) => q.id === questionId) ?? null
}
