import { NextResponse } from "next/server";
import { COACH_COOKIE_NAME } from "@/lib/coach-auth";

export const runtime = "nodejs";

/**
 * POST /api/coach/login
 * Body: { password }
 * Sets a httpOnly cookie if the password matches COACH_PASSWORD env var.
 */
export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const password = process.env.COACH_PASSWORD;
  if (!password) {
    return NextResponse.json(
      { error: "COACH_PASSWORD env var not set on server" },
      { status: 500 }
    );
  }

  if (body.password !== password) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COACH_COOKIE_NAME, password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 14, // 14 days
    path: "/",
  });
  return res;
}

/** POST /api/coach/logout — clear the cookie. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COACH_COOKIE_NAME);
  return res;
}
