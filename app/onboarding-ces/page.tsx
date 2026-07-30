import { redirect } from "next/navigation"
import { QuestionnaireRunner } from "@/components/onboarding/questionnaire-runner"
import { loadSession } from "@/lib/onboarding/actions"
import { getQuestionnaire } from "@/lib/onboarding/registry"

const SLUG = "ces-academy"

export const dynamic = "force-dynamic"

export default async function OnboardingCesPage({
  searchParams,
}: {
  searchParams: Promise<{ r?: string }>
}) {
  const { r } = await searchParams

  // Old or hand-edited links may carry the token here; the route handler is the
  // only place that can turn it into a session cookie.
  if (r) redirect(`/onboarding-ces/resume?r=${encodeURIComponent(r)}`)

  const { config, flat } = getQuestionnaire(SLUG)
  const session = await loadSession(SLUG)

  return (
    <QuestionnaireRunner
      config={config}
      questions={flat}
      initialSession={session}
      siteUrl={(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.conversionpartners.net").replace(
        /\/$/,
        "",
      )}
    />
  )
}
