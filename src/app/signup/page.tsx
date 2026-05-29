"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

function SignupForm() {
  const router = useRouter();
  const search = useSearchParams();
  const nextPath = search.get("next") || "/";
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [check, setCheck] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });
      if (error) throw error;
      setCheck(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  if (check) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-extrabold mb-3">Check your email.</h1>
        <p className="text-slate-400 mb-8">
          We sent a confirmation link to <strong>{email}</strong>. Open it on
          your phone or laptop to finish signing up.
        </p>
        <p className="text-xs text-slate-500">
          Didn&apos;t get the email? Check spam, or{" "}
          <button
            onClick={() => setCheck(false)}
            className="text-orange-400 underline"
          >
            try a different address
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <p className="text-orange-400 font-bold tracking-widest text-xs mb-2">
        SIGN UP
      </p>
      <h1 className="text-4xl font-extrabold mb-3">Get started.</h1>
      <p className="text-slate-400 mb-10">
        Free for early users. You can tweak your profile after sign up.
      </p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">
            Password
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            autoComplete="new-password"
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
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-400 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-orange-400 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:
          "linear-gradient(180deg, #0B1428 0%, #152544 60%, #0B1428 100%)",
      }}
    >
      <header className="border-b border-slate-800/60 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 max-w-md mx-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span className="font-bold text-lg">CourtIQ</span>
        </Link>
      </header>
      <Suspense fallback={null}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
