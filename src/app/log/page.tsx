"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";

const STORAGE_KEY = "courtiq_log_v1";

type Game = {
  id: string;
  date: string; // YYYY-MM-DD
  opponent: string;
  result: "W" | "L";
  team_score: number;
  opp_score: number;
  minutes: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fg2m?: number;
  fg2a?: number;
  fg3m?: number;
  fg3a?: number;
  ftm?: number;
  fta?: number;
  notes?: string;
  created_at: string;
};

const NUMERIC_FIELDS: (keyof Game)[] = [
  "team_score",
  "opp_score",
  "minutes",
  "points",
  "rebounds",
  "assists",
  "steals",
  "blocks",
  "turnovers",
  "fg2m",
  "fg2a",
  "fg3m",
  "fg3a",
  "ftm",
  "fta",
];

export default function LogPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [mode, setMode] = useState<"view" | "form">("view");
  const [editing, setEditing] = useState<Game | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setGames(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const persist = (next: Game[]) => {
    setGames(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const saveGame = (g: Game) => {
    const idx = games.findIndex((x) => x.id === g.id);
    const next = idx >= 0
      ? [...games.slice(0, idx), g, ...games.slice(idx + 1)]
      : [g, ...games];
    // Sort by date desc
    next.sort((a, b) => b.date.localeCompare(a.date));
    persist(next);
    setMode("view");
    setEditing(null);
  };

  const deleteGame = (id: string) => {
    if (!confirm("Delete this game log?")) return;
    persist(games.filter((g) => g.id !== id));
    setExpandedId(null);
  };

  const startNew = () => {
    setEditing(null);
    setMode("form");
  };

  const startEdit = (g: Game) => {
    setEditing(g);
    setMode("form");
  };

  return (
    <div
      className="min-h-screen text-white pb-32"
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
        <div className="flex items-center gap-4 text-sm text-slate-300">
          <Link href="/plan" className="hover:text-orange-400">Plan</Link>
          <Link href="/chat" className="hover:text-orange-400">Coach</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {mode === "form" ? (
          <GameForm
            initial={editing}
            onCancel={() => {
              setMode("view");
              setEditing(null);
            }}
            onSave={saveGame}
          />
        ) : games.length === 0 ? (
          <EmptyState onAdd={startNew} />
        ) : (
          <Dashboard
            games={games}
            onAdd={startNew}
            onEdit={startEdit}
            onDelete={deleteGame}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
          />
        )}
      </main>

      {mode === "view" && games.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 border-t border-slate-800/60 px-4 py-3"
          style={{ background: "rgba(11,20,40,0.92)", backdropFilter: "blur(8px)" }}
        >
          <button
            onClick={startNew}
            className="w-full max-w-3xl mx-auto block py-3 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-orange-500 to-orange-400 hover:opacity-90 transition"
          >
            + Log new game
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="text-center mt-12">
      <p className="text-orange-400 font-bold tracking-widest text-xs mb-3">
        GAME LOG
      </p>
      <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
        Track every game.
      </h1>
      <p className="text-slate-400 mb-10 max-w-md mx-auto">
        Log your stats after each game. See trends, spot weaknesses, watch
        your numbers move.
      </p>
      <button
        onClick={onAdd}
        className="px-6 py-3 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-orange-500 to-orange-400 hover:opacity-90 transition"
      >
        Log your first game
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
function Dashboard({
  games,
  onAdd,
  onEdit,
  onDelete,
  expandedId,
  setExpandedId,
}: {
  games: Game[];
  onAdd: () => void;
  onEdit: (g: Game) => void;
  onDelete: (id: string) => void;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
}) {
  const wins = games.filter((g) => g.result === "W").length;
  const losses = games.length - wins;

  const seasonAvg = avgs(games);
  const last5Avg = avgs(games.slice(0, 5));
  const prior5Avg = avgs(games.slice(5, 10));

  return (
    <div>
      <p className="text-orange-400 font-bold tracking-widest text-xs mb-2">
        SEASON SUMMARY
      </p>
      <div className="flex items-baseline gap-3 mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold">
          {games.length} {games.length === 1 ? "game" : "games"}
        </h1>
        <p className="text-lg text-slate-400">{wins}W &middot; {losses}L</p>
      </div>

      {/* Average stat cards */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
        <StatCard label="PTS" value={seasonAvg.points} trend={trendValue(last5Avg, prior5Avg, "points")} />
        <StatCard label="REB" value={seasonAvg.rebounds} trend={trendValue(last5Avg, prior5Avg, "rebounds")} />
        <StatCard label="AST" value={seasonAvg.assists} trend={trendValue(last5Avg, prior5Avg, "assists")} />
        <StatCard label="STL" value={seasonAvg.steals} trend={trendValue(last5Avg, prior5Avg, "steals")} />
        <StatCard label="BLK" value={seasonAvg.blocks} trend={trendValue(last5Avg, prior5Avg, "blocks")} />
        <StatCard label="TO" value={seasonAvg.turnovers} trend={trendValue(last5Avg, prior5Avg, "turnovers", true)} />
      </div>

      {/* Shooting splits if any data */}
      {(seasonAvg.fg2a > 0 || seasonAvg.fg3a > 0 || seasonAvg.fta > 0) && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          {seasonAvg.fg2a > 0 && (
            <SplitCard label="2PT%" pct={seasonAvg.fg2m / seasonAvg.fg2a} made={games.reduce((s, g) => s + (g.fg2m || 0), 0)} att={games.reduce((s, g) => s + (g.fg2a || 0), 0)} />
          )}
          {seasonAvg.fg3a > 0 && (
            <SplitCard label="3PT%" pct={seasonAvg.fg3m / seasonAvg.fg3a} made={games.reduce((s, g) => s + (g.fg3m || 0), 0)} att={games.reduce((s, g) => s + (g.fg3a || 0), 0)} />
          )}
          {seasonAvg.fta > 0 && (
            <SplitCard label="FT%" pct={seasonAvg.ftm / seasonAvg.fta} made={games.reduce((s, g) => s + (g.ftm || 0), 0)} att={games.reduce((s, g) => s + (g.fta || 0), 0)} />
          )}
        </div>
      )}

      <p className="text-orange-400 font-bold tracking-widest text-xs mb-3">
        GAMES
      </p>
      <div className="space-y-3">
        {games.map((g) => (
          <GameCard
            key={g.id}
            game={g}
            expanded={expandedId === g.id}
            onToggle={() => setExpandedId(expandedId === g.id ? null : g.id)}
            onEdit={() => onEdit(g)}
            onDelete={() => onDelete(g.id)}
          />
        ))}
      </div>

      {/* spacer for sticky footer */}
      <div className="h-16" />
    </div>
  );
}

function StatCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: number;
  trend: number | null;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-extrabold">{value.toFixed(1)}</p>
      {trend !== null && (
        <p
          className={`text-xs font-bold mt-1 ${
            trend > 0.1 ? "text-green-400" : trend < -0.1 ? "text-red-400" : "text-slate-500"
          }`}
        >
          {trend > 0.1 ? "↑" : trend < -0.1 ? "↓" : "→"} {Math.abs(trend).toFixed(1)}
        </p>
      )}
    </div>
  );
}

function SplitCard({ label, pct, made, att }: { label: string; pct: number; made: number; att: number }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-extrabold">{Math.round(pct * 100)}%</p>
      <p className="text-xs text-slate-500 mt-1">{made}/{att}</p>
    </div>
  );
}

function GameCard({
  game: g,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  game: Game;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const dateStr = new Date(g.date + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-3 hover:bg-slate-800/60 transition"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${
                g.result === "W" ? "bg-green-900/60 text-green-300" : "bg-red-900/60 text-red-300"
              }`}
            >
              {g.result}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold truncate">vs {g.opponent || "Opponent"}</p>
              <p className="text-xs text-slate-400">
                {dateStr} &middot; {g.team_score}-{g.opp_score}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-extrabold text-lg">{g.points}</p>
            <p className="text-xs text-slate-400">
              {g.rebounds}r / {g.assists}a
            </p>
          </div>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-slate-700/60 px-4 py-4 space-y-3">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <Stat label="MIN" value={g.minutes} />
            <Stat label="PTS" value={g.points} />
            <Stat label="REB" value={g.rebounds} />
            <Stat label="AST" value={g.assists} />
            <Stat label="STL" value={g.steals} />
            <Stat label="BLK" value={g.blocks} />
            <Stat label="TO" value={g.turnovers} />
            {(g.fg2a || g.fg3a || g.fta) && (
              <>
                {g.fg2a ? <Stat label="2FG" value={`${g.fg2m || 0}/${g.fg2a}`} /> : null}
                {g.fg3a ? <Stat label="3FG" value={`${g.fg3m || 0}/${g.fg3a}`} /> : null}
                {g.fta ? <Stat label="FT" value={`${g.ftm || 0}/${g.fta}`} /> : null}
              </>
            )}
          </div>
          {g.notes && (
            <div className="bg-slate-900/40 rounded-lg p-3 text-sm text-slate-300 italic">
              &ldquo;{g.notes}&rdquo;
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onEdit}
              className="flex-1 py-2 rounded-lg text-sm border border-slate-600 hover:border-orange-400 transition"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="flex-1 py-2 rounded-lg text-sm border border-red-900/60 text-red-400 hover:bg-red-900/20 transition"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------
function GameForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Game | null;
  onSave: (g: Game) => void;
  onCancel: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<Partial<Game>>(
    initial ?? {
      date: today,
      opponent: "",
      result: "W",
      team_score: 0,
      opp_score: 0,
      minutes: 0,
      points: 0,
      rebounds: 0,
      assists: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
    }
  );
  const [showSplits, setShowSplits] = useState(
    !!(initial?.fg2a || initial?.fg3a || initial?.fta)
  );
  const [showNotes, setShowNotes] = useState(!!initial?.notes);

  const set = <K extends keyof Game>(k: K, v: Game[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const id = initial?.id ?? crypto.randomUUID();
    const created_at = initial?.created_at ?? new Date().toISOString();
    onSave({
      id,
      created_at,
      date: form.date || today,
      opponent: (form.opponent ?? "").trim() || "Opponent",
      result: (form.result as "W" | "L") || "W",
      team_score: Number(form.team_score) || 0,
      opp_score: Number(form.opp_score) || 0,
      minutes: Number(form.minutes) || 0,
      points: Number(form.points) || 0,
      rebounds: Number(form.rebounds) || 0,
      assists: Number(form.assists) || 0,
      steals: Number(form.steals) || 0,
      blocks: Number(form.blocks) || 0,
      turnovers: Number(form.turnovers) || 0,
      fg2m: numOrUndef(form.fg2m),
      fg2a: numOrUndef(form.fg2a),
      fg3m: numOrUndef(form.fg3m),
      fg3a: numOrUndef(form.fg3a),
      ftm: numOrUndef(form.ftm),
      fta: numOrUndef(form.fta),
      notes: (form.notes ?? "").trim() || undefined,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold">
          {initial ? "Edit game" : "Log a game"}
        </h1>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-slate-400 hover:text-white"
        >
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextField label="Date" type="date" value={form.date || ""} onChange={(v) => set("date", v)} />
        <TextField label="Opponent" value={form.opponent || ""} onChange={(v) => set("opponent", v)} placeholder="vs..." />
      </div>

      <Field label="Result">
        <div className="flex gap-2">
          {(["W", "L"] as const).map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => set("result", r)}
              className={`flex-1 py-3 rounded-lg font-bold border transition ${
                form.result === r
                  ? r === "W"
                    ? "bg-green-600 border-green-600 text-white"
                    : "bg-red-600 border-red-600 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300"
              }`}
            >
              {r === "W" ? "Win" : "Loss"}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <NumberField label="Your team score" value={form.team_score} onChange={(v) => set("team_score", v)} />
        <NumberField label="Opp score" value={form.opp_score} onChange={(v) => set("opp_score", v)} />
      </div>

      <Field label="Your stats">
        <div className="grid grid-cols-3 gap-3">
          <NumberField compact label="MIN" value={form.minutes} onChange={(v) => set("minutes", v)} />
          <NumberField compact label="PTS" value={form.points} onChange={(v) => set("points", v)} />
          <NumberField compact label="REB" value={form.rebounds} onChange={(v) => set("rebounds", v)} />
          <NumberField compact label="AST" value={form.assists} onChange={(v) => set("assists", v)} />
          <NumberField compact label="STL" value={form.steals} onChange={(v) => set("steals", v)} />
          <NumberField compact label="BLK" value={form.blocks} onChange={(v) => set("blocks", v)} />
          <NumberField compact label="TO" value={form.turnovers} onChange={(v) => set("turnovers", v)} />
        </div>
      </Field>

      <button
        type="button"
        onClick={() => setShowSplits(!showSplits)}
        className="text-sm text-orange-400 hover:underline"
      >
        {showSplits ? "− Hide" : "+ Add"} shooting splits
      </button>

      {showSplits && (
        <Field label="Shooting (made / attempted)">
          <div className="grid grid-cols-3 gap-3">
            <SplitInput label="2FG" m={form.fg2m} a={form.fg2a} onM={(v) => set("fg2m", v)} onA={(v) => set("fg2a", v)} />
            <SplitInput label="3FG" m={form.fg3m} a={form.fg3a} onM={(v) => set("fg3m", v)} onA={(v) => set("fg3a", v)} />
            <SplitInput label="FT" m={form.ftm} a={form.fta} onM={(v) => set("ftm", v)} onA={(v) => set("fta", v)} />
          </div>
        </Field>
      )}

      <button
        type="button"
        onClick={() => setShowNotes(!showNotes)}
        className="text-sm text-orange-400 hover:underline"
      >
        {showNotes ? "− Hide" : "+ Add"} notes
      </button>

      {showNotes && (
        <Field label="Notes (one sentence)">
          <textarea
            value={form.notes || ""}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="How'd you play? What worked, what didn't?"
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </Field>
      )}

      <button
        type="submit"
        className="w-full py-4 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-orange-500 to-orange-400 hover:opacity-90 transition"
      >
        {initial ? "Save changes" : "Save game"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-300 mb-2">{label}</label>
      {children}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <Field label={label}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
      />
    </Field>
  );
}

function NumberField({
  label,
  value,
  onChange,
  compact = false,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number) => void;
  compact?: boolean;
}) {
  const inner = (
    <input
      type="number"
      inputMode="numeric"
      pattern="[0-9]*"
      value={value ?? ""}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-orange-500 text-center font-bold"
    />
  );
  if (compact) {
    return (
      <div>
        <p className="text-xs text-slate-400 mb-1 text-center">{label}</p>
        {inner}
      </div>
    );
  }
  return <Field label={label}>{inner}</Field>;
}

function SplitInput({
  label,
  m,
  a,
  onM,
  onA,
}: {
  label: string;
  m: number | undefined;
  a: number | undefined;
  onM: (v: number) => void;
  onA: (v: number) => void;
}) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-1 text-center">{label}</p>
      <div className="flex items-center gap-1">
        <input
          type="number"
          inputMode="numeric"
          placeholder="0"
          value={m ?? ""}
          onChange={(e) => onM(Number(e.target.value))}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white text-center font-bold focus:outline-none focus:border-orange-500"
        />
        <span className="text-slate-500">/</span>
        <input
          type="number"
          inputMode="numeric"
          placeholder="0"
          value={a ?? ""}
          onChange={(e) => onA(Number(e.target.value))}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white text-center font-bold focus:outline-none focus:border-orange-500"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Math helpers
// ---------------------------------------------------------------------------
type Avgs = {
  points: number; rebounds: number; assists: number;
  steals: number; blocks: number; turnovers: number;
  fg2m: number; fg2a: number; fg3m: number; fg3a: number;
  ftm: number; fta: number;
};

function avgs(games: Game[]): Avgs {
  const n = games.length || 1;
  const zero: Avgs = {
    points: 0, rebounds: 0, assists: 0,
    steals: 0, blocks: 0, turnovers: 0,
    fg2m: 0, fg2a: 0, fg3m: 0, fg3a: 0,
    ftm: 0, fta: 0,
  };
  if (!games.length) return zero;
  const sum = games.reduce<Avgs>((acc, g) => ({
    points: acc.points + g.points,
    rebounds: acc.rebounds + g.rebounds,
    assists: acc.assists + g.assists,
    steals: acc.steals + g.steals,
    blocks: acc.blocks + g.blocks,
    turnovers: acc.turnovers + g.turnovers,
    fg2m: acc.fg2m + (g.fg2m || 0),
    fg2a: acc.fg2a + (g.fg2a || 0),
    fg3m: acc.fg3m + (g.fg3m || 0),
    fg3a: acc.fg3a + (g.fg3a || 0),
    ftm: acc.ftm + (g.ftm || 0),
    fta: acc.fta + (g.fta || 0),
  }), zero);
  return {
    points: sum.points / n,
    rebounds: sum.rebounds / n,
    assists: sum.assists / n,
    steals: sum.steals / n,
    blocks: sum.blocks / n,
    turnovers: sum.turnovers / n,
    fg2m: sum.fg2m / n, fg2a: sum.fg2a / n,
    fg3m: sum.fg3m / n, fg3a: sum.fg3a / n,
    ftm: sum.ftm / n, fta: sum.fta / n,
  };
}

function trendValue(
  recent: Avgs,
  prior: Avgs,
  key: keyof Avgs,
  inverted = false
): number | null {
  // Need at least one prior to compare
  if (prior.points === 0 && prior.rebounds === 0) return null;
  const diff = recent[key] - prior[key];
  return inverted ? -diff : diff;
}

function numOrUndef(v: unknown): number | undefined {
  const n = Number(v);
  if (!isFinite(n) || n <= 0) return undefined;
  return n;
}
