"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function CoachLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/coach/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `${res.status}`);
      }
      router.push("/coach/queue");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-slate-300 mb-2">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
        />
      </div>
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-200 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-orange-500 to-orange-400 hover:opacity-90 disabled:opacity-50 transition"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
