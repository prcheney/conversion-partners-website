import { notFound } from "next/navigation"
import { SingleQuestion } from "@/components/onboarding/single-question"
import { getAssignmentByToken, getRespondentById } from "@/lib/onboarding/db"
import { findQuestion, getQuestionnaire } from "@/lib/onboarding/registry"

const SLUG = "ces-academy"

export const dynamic = "force-dynamic"

export default async function AssignedQuestionPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const assignment = await getAssignmentByToken(token)

  // A bad or expired token gets a 404 rather than an explanation — there's
  // nothing useful to say to someone guessing at tokens.
  if (!assignment || assignment.questionnaire_slug !== SLUG) notFound()

  const question = findQuestion(SLUG, assignment.question_id)
  if (!question) notFound()

  const { config } = getQuestionnaire(SLUG)
  const asker = await getRespondentById(assignment.assigned_by)

  return (
    <SingleQuestion
      token={token}
      config={config}
      question={question}
      askedBy={asker?.name ?? "Someone on your team"}
      note={assignment.note}
      alreadyClosed={assignment.status !== "pending"}
    />
  )
}
