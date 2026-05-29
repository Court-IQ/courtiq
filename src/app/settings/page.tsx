import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import SettingsForm from "./settings-form";

export const metadata = { title: "Settings — CourtIQ" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/settings");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:
          "linear-gradient(180deg, #0B1428 0%, #152544 60%, #0B1428 100%)",
      }}
    >
      <header className="border-b border-slate-800/60 px-4 py-3 flex items-center justify-between max-w-3xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span className="font-bold text-lg">CourtIQ</span>
        </Link>
        <span className="text-xs text-slate-400">Settings</span>
      </header>

      <main className="max-w-md mx-auto px-6 py-12">
        <p className="text-orange-400 font-bold tracking-widest text-xs mb-2">
          PROFILE
        </p>
        <h1 className="text-3xl font-extrabold mb-8">Your settings.</h1>

        <SettingsForm
          userEmail={user.email ?? ""}
          initial={profile ?? {
            name: "",
            jersey_number: "",
            position: "",
            level: "",
            school_team: "",
            height_inches: null,
          }}
        />
      </main>
    </div>
  );
}
