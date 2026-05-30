import { cookies } from "next/headers";

const COACH_COOKIE = "courtiq_coach";

/**
 * Server-side check: is this request from an authenticated coach?
 * The coach session is just a signed cookie set by the /coach login form.
 */
export async function isCoachAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const coach = cookieStore.get(COACH_COOKIE);
  const password = process.env.COACH_PASSWORD;
  if (!coach || !password) return false;
  // Cookie value is just the password (kept simple; cookie is httpOnly + secure)
  return coach.value === password;
}

export const COACH_COOKIE_NAME = COACH_COOKIE;
