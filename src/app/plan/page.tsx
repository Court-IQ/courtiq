"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";

const STORAGE_KEY = "courtiq_plan_v1";

type PlanInput = {
  position: string;
  level: string;
  focus: string;
  minutes_per_day: number;
  days_per_week: number;
};

type Drill = { name: string; description: string; reps_or_time: string };
type Day = {
  day_number: number;
  title: string;
  warmup: string;
  drills: Drill[];
  cooldown: string;
  total_minutes: number;
};
type PlanResponse = { summary: string; days: Day[] };

type StoredPlan = {
  input: PlanInput;
  plan: PlanResponse;
  completed: Record<number, boolean>;
  created_at: string;
};

const POSITIONS = ["1", "2", "3", "4", "5"];
const LEVELS = ["High School", "College", "Pro"];
const FOCUS_AREAS = [
  "Shooting",
  "Ball handling",
  "Finishing at the rim",
  "Game IQ + film",
];
const TIMES = [15, 30, 45, 60, 90];
const DAYS = [3, 4, 5, 6, 7];

export default function PlanPage() {
  const [stored, setStored] = useState<StoredPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setStored(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const save = (s: StoredPlan) => {
    setStored(s);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      // localStorage might be disabled
    }
  };

  const generate = async (input: PlanInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      save({
        input,
        plan: data as PlanResponse,
        completed: {},
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (n: number) => {
    if (!stored) return;
    const completed = { ...stored.completed, [n]: !stored.completed[n] };
    save({ ...stored, completed });
  };

  const reset = () => {
    setStored(null);
    setError(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

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
        <Link href="/chat" className="text-sm text-slate-300 hover:text-orange-400">
          Ask the coach →
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {!stored ? (
          <PlanForm onSubmit={generate} loading={loading} error={error} />
        ) : (
          <PlanView
            stored={stored}
            onToggle={toggleDay}
            onReset={reset}
          />
        )}
      </main>
    </div>
  );
}

function PlanForm({
  onSubmit,
  loading,
  error,
}: {
  onSubmit: (input: PlanInput) => void;
  loading: boolean;
  error: string | null;
}) {
  const [position, setPosition] = useState(POSITIONS[0]);
  const [level, setLevel] = useState(LEVELS[1]);
  const [focus, setFocus] = useState(FOCUS_AREAS[0]);
  const [minutes, setMinutes] = useState(30);
  const [days, setDays] = useState(5);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    onSubmit({
      position,
      level,
      focus,
      minutes_per_day: minutes,
      days_per_week: days,
    });
  };

  return (
    <div>
      <p className="text-orange-400 font-bold tracking-widest text-xs mb-3">
        7-DAY PLAN
      </p>
      <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
        Build your week.
      </h1>
      <p className="text-slate-400 mb-10">
        Answer 5 questions. Get a personalized 7-day development plan.
      </p>

      <form onSubmit={submit} className="space-y-6">
        <Field label="Position">
          <Selector value={position} options={POSITIONS} onChange={setPosition} />
        </Field>
        <Field label="Level">
          <Selector value={level} options={LEVELS} onChange={setLevel} />
        </Field>
        <Field label="Main focus this week">
          <Selector value={focus} options={FOCUS_AREAS} onChange={setFocus} />
        </Field>
        <Field label={`Minutes per day: ${minutes}`}>
          <ChipGroup
            options={TIMES.map((t) => ({ value: t, label: `${t}` }))}
            value={minutes}
            onChange={setMinutes}
          />
        </Field>
        <Field label={`Days per week: ${days}`}>
          <ChipGroup
            options={DAYS.map((d) => ({ value: d, label: `${d}` }))}
            value={days}
            onChange={setDays}
          />
        </Field>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-200 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-orange-500 to-orange-400 hover:opacity-90 disabled:opacity-50 transition"
        >
          {loading ? "Building your plan..." : "Generate plan"}
        </button>

        <p className="text-xs text-slate-500 text-center">
          Takes 5-15 seconds. Don&apos;t refresh.
        </p>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-300 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function Selector<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-4 py-2 rounded-lg border text-sm transition ${
            value === opt
              ? "bg-orange-500 border-orange-500 text-slate-900 font-bold"
              : "bg-slate-800 border-slate-700 text-slate-200 hover:border-slate-500"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function ChipGroup<T extends number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-5 py-2 rounded-lg border text-sm font-bold transition min-w-[60px] ${
            value === opt.value
              ? "bg-orange-500 border-orange-500 text-slate-900"
              : "bg-slate-800 border-slate-700 text-slate-200 hover:border-slate-500"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function PlanView({
  stored,
  onToggle,
  onReset,
}: {
  stored: StoredPlan;
  onToggle: (n: number) => void;
  onReset: () => void;
}) {
  const completedCount = Object.values(stored.completed).filter(Boolean).length;
  const total = stored.plan.days.length;
  const created = new Date(stored.created_at).toLocaleDateString();

  return (
    <div>
      <p className="text-orange-400 font-bold tracking-widest text-xs mb-2">
        YOUR PLAN  ·  CREATED {created.toUpperCase()}
      </p>
      <h1 className="text-2xl md:text-3xl font-extrabold mb-3">
        {stored.input.focus} · {stored.input.position}
      </h1>
      <p className="text-slate-300 mb-6 italic">&ldquo;{stored.plan.summary}&rdquo;</p>

      {/* progress */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 mb-1">PROGRESS</p>
          <p className="text-lg font-bold">
            {completedCount} / {total} days complete
          </p>
        </div>
        <div className="flex-1 max-w-[200px] ml-6">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all"
              style={{ width: `${(completedCount / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* days */}
      <div className="space-y-4">
        {stored.plan.days.map((day) => {
          const done = !!stored.completed[day.day_number];
          return (
            <div
              key={day.day_number}
              className={`bg-slate-800/40 border rounded-2xl p-5 transition ${
                done ? "border-orange-500/60 opacity-60" : "border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between mb-3 gap-3">
                <div className="flex-1">
                  <p className="text-xs text-orange-400 font-bold tracking-widest mb-1">
                    DAY {day.day_number}  ·  {day.total_minutes} MIN
                  </p>
                  <h3 className="text-xl font-extrabold">{day.title}</h3>
                </div>
                <button
                  onClick={() => onToggle(day.day_number)}
                  className={`w-8 h-8 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${
                    done
                      ? "bg-orange-500 border-orange-500 text-slate-900"
                      : "border-slate-500 hover:border-orange-400"
                  }`}
                  aria-label={done ? "Mark incomplete" : "Mark complete"}
                >
                  {done && "✓"}
                </button>
              </div>

              <div className="text-sm text-slate-300 mb-3">
                <span className="font-bold text-slate-200">Warmup: </span>
                {day.warmup}
              </div>

              <ol className="space-y-3 mb-3">
                {day.drills.map((d, i) => (
                  <li
                    key={i}
                    className="bg-slate-900/40 rounded-lg px-4 py-3 border border-slate-700/40"
                  >
                    <div className="flex justify-between items-start gap-3 mb-1">
                      <p className="font-bold">{d.name}</p>
                      <p className="text-xs text-orange-400 font-bold whitespace-nowrap">
                        {d.reps_or_time}
                      </p>
                    </div>
                    <p className="text-sm text-slate-300">{d.description}</p>
                  </li>
                ))}
              </ol>

              <div className="text-sm text-slate-300">
                <span className="font-bold text-slate-200">Cooldown: </span>
                {day.cooldown}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onReset}
        className="mt-8 w-full py-3 rounded-xl text-slate-300 border border-slate-700 hover:bg-slate-800 transition"
      >
        Start a new plan
      </button>
    </div>
  );
}
