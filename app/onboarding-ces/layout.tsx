import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CES Academy Onboarding | Conversion Partners",
  // A client's marketing background has no business in search results.
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-background">{children}</main>
}
