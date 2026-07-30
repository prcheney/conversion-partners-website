/**
 * Session cookie naming, shared by the server actions and the resume route
 * handler. Kept out of actions.ts because a "use server" module may only
 * export async functions.
 */
export function sessionCookieName(slug: string): string {
  return `cp_onboarding_${slug.replace(/[^a-z0-9]/gi, "_")}`
}

export const SESSION_MAX_AGE = 60 * 60 * 24 * 180
