import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { isCoachAuthenticated } from "@/lib/coach-auth";

export const runtime = "nodejs";

type RouteCtx = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/submissions/[id] — coach view of one submission.
 */
export async function GET(_req: Request, ctx: RouteCtx) {
  if (!(await isCoachAuthenticated())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const svc = createServiceClient();
  const { data, error } = await svc
    .from("submissions")
    .select("*, profiles!inner(email, name, jersey_number, position, level, school_team)")
    .eq("id", id)
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json({ submission: data });
}

/**
 * PATCH /api/admin/submissions/[id]
 * Body: any subset of { status, report_card_urls (string[]), report_pdf_url }
 * If status changes to 'ready', sets delivered_at automatically.
 */
export async function PATCH(req: Request, ctx: RouteCtx) {
  if (!(await isCoachAuthenticated())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (typeof body.status === "string") {
    const valid = ["pending", "in_progress", "ready", "cancelled"];
    if (!valid.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    update.status = body.status;
    if (body.status === "ready") {
      update.delivered_at = new Date().toISOString();
    }
  }
  if (Array.isArray(body.report_card_urls)) {
    update.report_card_urls = body.report_card_urls;
  }
  if (typeof body.report_pdf_url === "string") {
    update.report_pdf_url = body.report_pdf_url;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const svc = createServiceClient();
  const { data, error } = await svc
    .from("submissions")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ submission: data });
}
