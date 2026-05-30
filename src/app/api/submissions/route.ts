import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

/**
 * POST /api/submissions
 * Creates a new film analysis submission.
 *
 * Body: { opponent, game_date, jersey_number, film_url, notes }
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const film_url = String(body.film_url ?? "").trim();
  if (!film_url) {
    return NextResponse.json(
      { error: "film_url is required (Hudl link, file URL, or Supabase Storage path)" },
      { status: 400 }
    );
  }

  const insertPayload = {
    user_id: user.id,
    opponent: String(body.opponent ?? "").trim() || null,
    game_date: body.game_date ? String(body.game_date) : null,
    jersey_number: String(body.jersey_number ?? "").trim() || null,
    film_url,
    notes: String(body.notes ?? "").trim() || null,
  };

  const { data, error } = await supabase
    .from("submissions")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ submission: data }, { status: 201 });
}

/**
 * GET /api/submissions
 * Returns the authenticated user's submissions, newest first.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ submissions: data ?? [] });
}
