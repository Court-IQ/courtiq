import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase-server";
import { isCoachAuthenticated } from "@/lib/coach-auth";
import SubmissionEditor from "./editor";

export const metadata = { title: "Submission — HooprLab Coach" };
export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export default async function CoachSubmissionPage({ params }: RouteParams) {
  if (!(await isCoachAuthenticated())) redirect("/coach");

  const { id } = await params;
  const svc = createServiceClient();
  const { data, error } = await svc
    .from("submissions")
    .select(
      "*, profiles!inner(email, name, jersey_number, position, level, school_team, height_inches)"
    )
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  // If film_url is a Supabase Storage path (no http), get a signed read URL
  let playableUrl: string = data.film_url;
  if (!/^https?:\/\//i.test(data.film_url)) {
    const { data: signed } = await svc.storage
      .from("films")
      .createSignedUrl(data.film_url, 60 * 60 * 6);
    if (signed?.signedUrl) playableUrl = signed.signedUrl;
  }

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:
          "linear-gradient(180deg, #0B1428 0%, #152544 60%, #0B1428 100%)",
      }}
    >
      <header className="border-b border-slate-800/60 px-4 py-3 flex items-center justify-between">
        <Link href="/coach/queue" className="flex items-center gap-2 hover:text-orange-400">
          <span className="text-slate-400">←</span>
          <span className="text-sm">Back to queue</span>
        </Link>
        <span className="text-xs text-slate-400">Coach · Submission</span>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-6">
        {/* LEFT — film + player info */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <p className="text-orange-400 font-bold tracking-widest text-xs mb-1">
              FILM
            </p>
            <h1 className="text-2xl font-extrabold">
              vs {data.opponent || "Unknown opponent"}
            </h1>
            {data.game_date && (
              <p className="text-sm text-slate-400">
                Game date: {new Date(data.game_date + "T00:00:00").toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="bg-black rounded-2xl overflow-hidden border border-slate-700">
            {/^https?:\/\//.test(data.film_url) && /(hudl\.com|youtube\.com|youtu\.be|vimeo\.com)/i.test(data.film_url) ? (
              <div className="p-6 text-center">
                <p className="text-slate-300 mb-3">External link (Hudl / YouTube / Vimeo)</p>
                <a
                  href={data.film_url}
                  target="_blank"
                  rel="noopener"
                  className="inline-block px-5 py-3 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-orange-500 to-orange-400"
                >
                  Open film in new tab ↗
                </a>
                <p className="text-xs text-slate-500 mt-3 break-all">
                  {data.film_url}
                </p>
              </div>
            ) : (
              <video
                src={playableUrl}
                controls
                className="w-full max-h-[600px] bg-black"
              />
            )}
          </div>

          <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5">
            <p className="text-orange-400 font-bold tracking-widest text-xs mb-2">
              PLAYER NOTES
            </p>
            {data.notes ? (
              <p className="text-slate-200 italic">&ldquo;{data.notes}&rdquo;</p>
            ) : (
              <p className="text-slate-500 italic">No notes submitted.</p>
            )}
          </div>
        </div>

        {/* RIGHT — player profile + status controls + upload */}
        <div className="space-y-4">
          <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5">
            <p className="text-orange-400 font-bold tracking-widest text-xs mb-3">
              PLAYER
            </p>
            <p className="font-bold text-lg">
              {data.profiles.name || data.profiles.email}
            </p>
            <p className="text-sm text-slate-400">{data.profiles.email}</p>
            <dl className="text-sm mt-4 space-y-1">
              {data.jersey_number && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Jersey</dt>
                  <dd className="font-bold">
                    #{data.jersey_number}
                    {data.jersey_color ? (
                      <span className="text-slate-400 font-normal">
                        {" "}· {data.jersey_color}
                      </span>
                    ) : null}
                  </dd>
                </div>
              )}
              {data.profiles.position && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Position</dt>
                  <dd className="font-bold">{data.profiles.position}</dd>
                </div>
              )}
              {data.profiles.level && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Level</dt>
                  <dd className="font-bold">{data.profiles.level}</dd>
                </div>
              )}
              {data.profiles.school_team && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">School</dt>
                  <dd className="font-bold">{data.profiles.school_team}</dd>
                </div>
              )}
              {data.profiles.height_inches && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Height</dt>
                  <dd className="font-bold">
                    {Math.floor(data.profiles.height_inches / 12)}&apos;
                    {data.profiles.height_inches % 12}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <SubmissionEditor
            submission={{
              id: data.id,
              user_id: data.user_id,
              status: data.status,
              report_card_urls: data.report_card_urls ?? [],
              report_pdf_url: data.report_pdf_url,
            }}
          />
        </div>
      </main>
    </div>
  );
}
