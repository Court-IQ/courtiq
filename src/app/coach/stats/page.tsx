import Link from "next/link";
import { redirect } from "next/navigation";
import { isCoachAuthenticated } from "@/lib/coach-auth";
import { createServiceClient } from "@/lib/supabase-server";

export const metadata = { title: "Stats — HooprLab Coach" };
export const dynamic = "force-dynamic";

type AuthUser = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
};

type RecentSubmission = {
  id: string;
  user_id: string;
  status: string;
  focus: string | null;
  jersey_number: string | null;
  created_at: string;
};

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date: Date) {
  const d = startOfDay(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function timeAgo(iso: string) {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMin = Math.floor((now - then) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default async function StatsPage() {
  if (!(await isCoachAuthenticated())) redirect("/coach");

  const svc = createServiceClient();
  const now = new Date();
  const today = startOfDay(now).toISOString();
  const weekStart = startOfWeek(now).toISOString();

  // Fetch all auth users (paginated, but for now first 1000 is plenty)
  const { data: usersData } = await svc.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  const users = (usersData?.users ?? []) as AuthUser[];

  const totalUsers = users.length;
  const newToday = users.filter((u) => u.created_at >= today).length;
  const newThisWeek = users.filter((u) => u.created_at >= weekStart).length;
  const activeThisWeek = users.filter(
    (u) => u.last_sign_in_at && u.last_sign_in_at >= weekStart,
  ).length;

  // Submissions counts
  const { count: totalSubs } = await svc
    .from("submissions")
    .select("id", { count: "exact", head: true });
  const { count: pendingSubs } = await svc
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  const { count: inProgressSubs } = await svc
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("status", "in_progress");
  const { count: readySubs } = await svc
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("status", "ready");

  // Recent submissions
  const { data: recentSubs } = await svc
    .from("submissions")
    .select("id, user_id, status, focus, jersey_number, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  // Recent users
  const recentUsers = [...users]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 8);

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:
          "linear-gradient(180deg, #0B1428 0%, #152544 60%, #0B1428 100%)",
      }}
    >
      <header className="border-b border-slate-800/60 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/coach/queue"
            className="text-sm text-slate-400 hover:text-orange-400"
          >
            ← Queue
          </Link>
          <span className="text-sm text-slate-300 font-bold">Stats</span>
        </div>
        <span className="text-xs text-slate-500">Coach · Stats</span>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* User KPIs */}
        <section>
          <p className="text-orange-400 font-bold tracking-widest text-xs mb-3">
            USERS
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Kpi label="Total" value={totalUsers} />
            <Kpi label="New today" value={newToday} />
            <Kpi label="New this week" value={newThisWeek} />
            <Kpi label="Active this week" value={activeThisWeek} />
          </div>
        </section>

        {/* Submission KPIs */}
        <section>
          <p className="text-orange-400 font-bold tracking-widest text-xs mb-3">
            FILM SUBMISSIONS
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Kpi label="Total" value={totalSubs ?? 0} />
            <Kpi label="Pending" value={pendingSubs ?? 0} highlight />
            <Kpi label="In progress" value={inProgressSubs ?? 0} />
            <Kpi label="Ready" value={readySubs ?? 0} />
          </div>
        </section>

        {/* Recent submissions */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-orange-400 font-bold tracking-widest text-xs">
              RECENT FILM
            </p>
            <Link
              href="/coach/queue"
              className="text-xs text-slate-400 hover:text-orange-400"
            >
              View queue →
            </Link>
          </div>
          {recentSubs && recentSubs.length > 0 ? (
            <ul className="space-y-1.5">
              {(recentSubs as RecentSubmission[]).map((s) => (
                <li
                  key={s.id}
                  className="bg-slate-800/40 border border-slate-700 rounded-xl px-4 py-3 flex items-center justify-between"
                >
                  <Link
                    href={`/coach/${s.id}`}
                    className="flex-1 flex items-center gap-3"
                  >
                    <StatusBadge status={s.status} />
                    <span className="text-sm">
                      {s.focus || "(no focus set)"}
                    </span>
                    {s.jersey_number ? (
                      <span className="text-xs text-slate-400">
                        #{s.jersey_number}
                      </span>
                    ) : null}
                  </Link>
                  <span className="text-xs text-slate-500">
                    {timeAgo(s.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 italic">No submissions yet.</p>
          )}
        </section>

        {/* Recent users */}
        <section>
          <p className="text-orange-400 font-bold tracking-widest text-xs mb-3">
            RECENT SIGNUPS
          </p>
          {recentUsers.length > 0 ? (
            <ul className="space-y-1.5">
              {recentUsers.map((u) => (
                <li
                  key={u.id}
                  className="bg-slate-800/40 border border-slate-700 rounded-xl px-4 py-3 flex items-center justify-between"
                >
                  <span className="text-sm truncate">
                    {u.email || u.id.slice(0, 8)}
                  </span>
                  <span className="text-xs text-slate-500">
                    {timeAgo(u.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 italic">No users yet.</p>
          )}
        </section>
      </main>
    </div>
  );
}

function Kpi({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-4 ${
        highlight
          ? "bg-orange-500/10 border-orange-500/40"
          : "bg-slate-800/40 border-slate-700"
      }`}
    >
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p
        className={`text-3xl font-extrabold ${
          highlight ? "text-orange-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const palette: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    in_progress: "bg-blue-500/15 text-blue-300 border-blue-500/40",
    ready: "bg-green-500/15 text-green-300 border-green-500/40",
    cancelled: "bg-slate-500/15 text-slate-300 border-slate-500/40",
  };
  const label: Record<string, string> = {
    pending: "Pending",
    in_progress: "In progress",
    ready: "Ready",
    cancelled: "Cancelled",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full border ${
        palette[status] ?? "bg-slate-500/15 text-slate-300 border-slate-500/40"
      }`}
    >
      {label[status] ?? status}
    </span>
  );
}
