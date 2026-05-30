import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { isCoachAuthenticated } from "@/lib/coach-auth";

export const runtime = "nodejs";

/**
 * GET /api/admin/submissions
 * Coach-only. Returns ALL submissions across all users, newest first.
 * Status filter via ?status=pending.
 */
export async function GET(req: Request) {
  if (!(await isCoachAuthenticated())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status");

  const svc = createServiceClient();

  let q = svc
    .from("submissions")
    .select("*, profiles!inner(email, name, jersey_number, position, level, school_team)")
    .order("created_at", { ascending: false });

  if (statusFilter) {
    q = q.eq("status", statusFilter);
  }

  const { data, error } = await q;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ submissions: data ?? [] });
}
