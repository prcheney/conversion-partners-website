import { NextResponse, type NextRequest } from "next/server"
import { getRespondentByToken } from "@/lib/onboarding/db"
import { getQuestionnaire } from "@/lib/onboarding/registry"
import { SESSION_MAX_AGE, sessionCookieName } from "@/lib/onboarding/session"

const SLUG = "ces-academy"

/**
 * The target of the emailed resume link. A Server Component can't set cookies,
 * so the token is exchanged for a session here and then dropped from the URL —
 * which also keeps it out of the browser history and any Referer header.
 */
export async function GET(request: NextRequest) {
  const { config } = getQuestionnaire(SLUG)
  const token = request.nextUrl.searchParams.get("r")
  const destination = new URL(config.path, request.nextUrl.origin)

  if (!token) return NextResponse.redirect(destination)

  const respondent = await getRespondentByToken(SLUG, token)
  if (!respondent) return NextResponse.redirect(destination)

  const response = NextResponse.redirect(destination)
  response.cookies.set(sessionCookieName(SLUG), respondent.resume_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
  return response
}
