"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

type Profile = {
  name?: string | null;
  jersey_number?: string | null;
  position?: string | null;
  level?: string | null;
  school_team?: string | null;
  height_inches?: number | null;
};

const POSITIONS = ["1", "2", "3", "4", "5"];
const LEVELS = ["High School", "College", "Pro"];

export default function SettingsForm({
  userEmail,
  initial,
}: {
  userEmail: string;
  initial: Profile;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState<Profile>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    setSaved(false);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setError(null);
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        email: userEmail,
        name: form.name || null,
        jersey_number: form.jersey_number || null,
        position: form.position || null,
        level: form.level || null,
        school_team: form.school_team || null,
        height_inches: form.height_inches || null,
      });
      if (error) throw error;
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <form onSubmit={save} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={userEmail}
            disabled
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">
            Name
          </label>
          <input
            type="text"
            value={form.name ?? ""}
            onChange={(e) => set("name", e.target.value)}
            placeholder="First Last"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">
            Jersey #
          </label>
          <input
            type="text"
            value={form.jersey_number ?? ""}
            onChange={(e) => set("jersey_number", e.target.value)}
            placeholder="e.g. 23"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">
            Position
          </label>
          <div className="flex flex-wrap gap-2">
            {POSITIONS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => set("position", form.position === p ? null : p)}
                className={`px-4 py-2 rounded-lg border text-sm font-bold transition ${
                  form.position === p
                    ? "bg-orange-500 border-orange-500 text-slate-900"
                    : "bg-slate-800 border-slate-700 text-slate-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">
            Level
          </label>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => set("level", form.level === l ? null : l)}
                className={`px-4 py-2 rounded-lg border text-sm transition ${
                  form.level === l
                    ? "bg-orange-500 border-orange-500 text-slate-900 font-bold"
                    : "bg-slate-800 border-slate-700 text-slate-200"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">
            School / Team
          </label>
          <input
            type="text"
            value={form.school_team ?? ""}
            onChange={(e) => set("school_team", e.target.value)}
            placeholder="e.g. Springfield High"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">
            Height (inches, optional)
          </label>
          <input
            type="number"
            value={form.height_inches ?? ""}
            onChange={(e) =>
              set(
                "height_inches",
                e.target.value ? parseInt(e.target.value) : null,
              )
            }
            placeholder="e.g. 74 for 6'2"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-200 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {saved && (
          <div className="bg-green-900/30 border border-green-700 text-green-200 rounded-lg px-4 py-3 text-sm">
            Saved.
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-orange-500 to-orange-400 hover:opacity-90 disabled:opacity-50 transition"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </form>

      <div className="mt-12 pt-6 border-t border-slate-800">
        <button
          onClick={signOut}
          className="text-sm text-slate-400 hover:text-red-400"
        >
          Sign out
        </button>
      </div>
    </>
  );
}
