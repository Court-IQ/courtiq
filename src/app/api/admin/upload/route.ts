import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { isCoachAuthenticated } from "@/lib/coach-auth";

export const runtime = "nodejs";

/**
 * POST /api/admin/upload
 * Form data: { submission_id, user_id, kind ("card" | "pdf"), file }
 * Coach uploads a report file into the 'reports' Storage bucket under the
 * user's folder. Returns a signed URL (7-day expiry) that gets stored in
 * the submission row.
 */
export async function POST(req: Request) {
  if (!(await isCoachAuthenticated())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const submission_id = form.get("submission_id");
  const user_id = form.get("user_id");
  const kind = form.get("kind");
  const file = form.get("file");

  if (
    typeof submission_id !== "string" ||
    typeof user_id !== "string" ||
    typeof kind !== "string" ||
    !(file instanceof File)
  ) {
    return NextResponse.json(
      { error: "Missing submission_id, user_id, kind, or file" },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop() || "bin";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${user_id}/${submission_id}/${filename}`;

  const svc = createServiceClient();
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await svc.storage
    .from("reports")
    .upload(path, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Signed URL — 7 days. Users see this from their phone via the API.
  const { data: signed, error: signError } = await svc.storage
    .from("reports")
    .createSignedUrl(path, 60 * 60 * 24 * 7);
  if (signError) {
    return NextResponse.json({ error: signError.message }, { status: 500 });
  }

  return NextResponse.json({
    path,
    signed_url: signed.signedUrl,
    kind,
  });
}
