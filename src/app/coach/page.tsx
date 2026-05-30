import Link from "next/link";
import { redirect } from "next/navigation";
import { isCoachAuthenticated } from "@/lib/coach-auth";
import CoachLoginForm from "./login-form";

export const metadata = { title: "Coach — CourtIQ" };

export default async function CoachLoginPage() {
  if (await isCoachAuthenticated()) {
    redirect("/coach/queue");
  }

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:
          "linear-gradient(180deg, #0B1428 0%, #152544 60%, #0B1428 100%)",
      }}
    >
      <header className="border-b border-slate-800/60 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 max-w-md mx-auto"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span className="font-bold text-lg">CourtIQ</span>
        </Link>
      </header>

      <main className="max-w-md mx-auto px-6 py-20">
        <p className="text-orange-400 font-bold tracking-widest text-xs mb-2">
          COACH
        </p>
        <h1 className="text-4xl font-extrabold mb-8">Sign in to analyze.</h1>
        <CoachLoginForm />
      </main>
    </div>
  );
}
