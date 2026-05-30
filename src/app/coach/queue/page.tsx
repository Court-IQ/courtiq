import Link from "next/link";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase-server";
import { isCoachAuthenticated } from "@/lib/coach-auth";

export const metadata = { title: "Queue — CourtIQ Coach" };
export const dynamic = "force-dynamic";

type Submission = {
  id: string;
  user_id: string;
  opponent: string | null;
  game_date: string | null;
  jersey_number: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  profiles: {
    email: string;
    name: string | null;
    jersey_number: string | null;
    position: string | null;
    level: string | null;
    school_team: string | null;
  };
};

const STATUS_PILLS: Record<string, string> = {
  pending: "bg-yellow-900/40 text-yellow-300 border-yellow-700/40",
  in_progress: "bg-blue-900/40 text-blue-300 border-blue-700/40",
  ready: "bg-green-900/40 text-green-300 border-green-700/40",
  cancelled: "bg-slate-800 text-slate-400 border-slate-700",
};

export default async function CoachQueuePage() {
  if (!(await isCoachAuthenticated())) redirect("/coach");

  const svc = createServiceClient();
  const { data, error } = await svc
    .from("submissions")
    .select(
      "*, profiles!inner(email, name, jersey_number, position, level, school_team)"
    )
    .order("created_at", { ascending: false });

  const submissions = (data as Submission[] | null) ?? [];

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:
          "linear-gradient(180deg, #0B1428 0%, #152544 60%, #0B1428 100%)",
      }}
    >
      <header className="border-b border-slate-800/60 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span className="font-bold text-lg">CourtIQ</span>
        </Link>
        <span className="text-xs text-slate-400">Coach · Queue</span>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-orange-400 font-bold tracking-widest text-xs mb-2">
          INCOMING
        </p>
        <h1 className="text-3xl font-extrabold mb-8">
          {submissions.length} {submissions.length === 1 ? "submission" : "submissions"}
        </h1>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-200 rounded-lg px-4 py-3 text-sm mb-6">
            {error.message}
          </div>
        )}

        {submissions.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-12 text-center">
            <p className="text-slate-300 mb-1">No submissions yet.</p>
            <p className="text-slate-500 text-sm">
              When players submit film, they&apos;ll show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((s) => {
              const date = new Date(s.created_at).toLocaleDateString();
              const playerLabel = [
                s.profiles.name || s.profiles.email,
                s.jersey_number ? `#${s.jersey_number}` : null,
                s.profiles.position ? `${s.profiles.position}` : null,
                s.profiles.level,
              ]
                .filter(Boolean)
                .join("  ·  ");
              return (
                <Link
                  key={s.id}
                  href={`/coach/${s.id}`}
                  className="block bg-slate-800/40 border border-slate-700 hover:border-orange-500/60 rounded-2xl p-5 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded border ${
                            STATUS_PILLS[s.status] ?? STATUS_PILLS.pending
                          }`}
                        >
                          {s.status.replace("_", " ").toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400">
                          submitted {date}
                        </span>
                      </div>
                      <p className="font-bold text-lg">
                        vs {s.opponent || "Unknown opponent"}
                      </p>
                      <p className="text-sm text-slate-400 truncate">
                        {playerLabel}
                      </p>
                      {s.notes && (
                        <p className="text-sm text-slate-300 mt-2 line-clamp-2 italic">
                          &ldquo;{s.notes}&rdquo;
                        </p>
                      )}
                    </div>
                    <span className="text-slate-400 text-sm flex-shrink-0">
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
