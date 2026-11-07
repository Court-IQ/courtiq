#!/usr/bin/env python3
"""Build public/programs.json from the HooprLab Workout Builder workbook.

The builder (one row per workout, drills picked from a Drill Library) replaces
editing programs.xlsx by hand. Same output schema (v3) the app already reads.

Usage:
    cd ~/courtiq && python3 programs/build_from_builder.py [path/to/HooprLab_Workout_Builder.xlsx] [--check]
    --check  validate and print a summary without writing anything
"""

from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent
DEFAULT_BUILDER = Path.home() / "Downloads" / "hooprlab" / "HooprLab_Workout_Builder.xlsx"
OUT = ROOT.parent / "public" / "programs.json"
ARCHIVE = ROOT / "HooprLab_Workout_Builder.xlsx"

FOCUS_ORDER = ["Ball handling", "Finishing at the rim", "Perimeter moves", "Shooting"]
LEVELS = {"High School": "hs", "College": "col", "Pro": "pro"}
ABBR = {"Ball handling": "BH", "Finishing at the rim": "Finishing", "Perimeter moves": "Perimeter moves", "Shooting": "Shooting"}
SLUG = {"Ball handling": "bh", "Finishing at the rim": "fin", "Perimeter moves": "per", "Shooting": "shoot"}


def s(v) -> str:
    return "" if v is None else str(v).strip()


def allowed(minutes: int, focuses: list[str]) -> bool:
    k = len(focuses)
    ok = {15: k == 1, 30: k in (1, 2), 45: k in (2, 3), 60: k in (2, 3, 4)}.get(minutes, False)
    if k == 1 and focuses[0] == "Ball handling" and minutes >= 30:
        return False
    return ok


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    check = "--check" in sys.argv
    builder = Path(args[0]).expanduser() if args else DEFAULT_BUILDER
    if not builder.exists():
        sys.exit(f"ERROR: can't find {builder}")

    wb = openpyxl.load_workbook(builder, data_only=False)
    errors: list[str] = []
    warnings: list[str] = []

    # ---- drill library
    lib: dict[str, dict] = {}
    wd = wb["Drill Library"]
    for r, row in enumerate(wd.iter_rows(min_row=2, max_col=5, values_only=True), start=2):
        name, focus, reps, how, video = (s(v) for v in row)
        if not name:
            continue
        if name in lib:
            errors.append(f"Drill Library row {r}: '{name}' is listed twice")
        if focus not in FOCUS_ORDER:
            errors.append(f"Drill Library row {r}: '{name}' needs a Focus (one of {', '.join(FOCUS_ORDER)})")
        if not how:
            warnings.append(f"Drill Library row {r}: '{name}' has no 'How to do it' text")
        lib[name] = {"focus": focus, "reps": reps, "description": how, "video_url": video or None}

    # ---- workouts
    ws = wb["Workouts"]
    head = [s(c.value).split("\n")[0] for c in ws[1]]
    col = {h: i for i, h in enumerate(head)}
    need = ["Workout ID", "Level", "Minutes", "Focus"]
    for h in need:
        if h not in col:
            sys.exit(f"ERROR: Workouts tab is missing the '{h}' column header")
    drill_cols = [(col[f"Drill {k}"], col.get(f"Reps {k}")) for k in range(1, 99) if f"Drill {k}" in col]

    programs: list[dict] = []
    ids: set[str] = set()
    pending_auto: list[tuple[int, dict]] = []
    for r, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
        level, minutes_raw, focus_raw = s(row[col["Level"]]), row[col["Minutes"]], s(row[col["Focus"]])
        picked = [(s(row[dc]), s(row[rc]) if rc is not None else "") for dc, rc in drill_cols]
        picked = [(n, rp) for n, rp in picked if n]
        if not level and not focus_raw and not picked:
            continue  # empty row
        where = f"Workouts row {r}"
        if level not in LEVELS:
            errors.append(f"{where}: pick a Level (High School, College or Pro)")
            continue
        try:
            minutes = int(minutes_raw)
        except (TypeError, ValueError):
            errors.append(f"{where}: pick Minutes (15, 30, 45 or 60)")
            continue
        focuses = [f.strip() for f in focus_raw.split("+") if f.strip()]
        if not focuses or any(f not in FOCUS_ORDER for f in focuses):
            errors.append(f"{where}: pick a Focus from the dropdown")
            continue
        focuses.sort(key=FOCUS_ORDER.index)
        if not allowed(minutes, focuses):
            warnings.append(f"{where}: players can't pick {minutes} min + {focus_raw} in the app, so nobody will ever get this workout")
        if not picked:
            errors.append(f"{where}: add at least one drill")
            continue
        drills = []
        for n, rp in picked:
            d = lib.get(n)
            if not d:
                errors.append(f"{where}: drill '{n}' isn't in the Drill Library (add it there first)")
                continue
            drills.append({"name": n, "description": d["description"], "reps_or_time": rp or d["reps"], "video_url": d["video_url"], "focus": d["focus"]})
        title = s(row[col["Title (optional)"]]) if "Title (optional)" in col else ""
        summary = s(row[col["Summary (optional)"]]) if "Summary (optional)" in col else ""
        prog = {
            "id": s(row[col["Workout ID"]]),
            "title": title or f"{minutes}-min {level} · {', '.join(ABBR[f] for f in focuses)}",
            "byline": "Coach Matthew",
            "level": [level],
            "focus": focuses,
            "minutes_per_day": minutes,
            "summary": summary or f"{minutes} min · {' + '.join(focuses)}",
            "days": [{"day_number": 1, "title": "Today's Workout", "total_minutes": minutes, "drills": drills}],
        }
        if prog["id"]:
            if not re.fullmatch(r"[a-z0-9+\-]+", prog["id"]):
                errors.append(f"{where}: Workout ID '{prog['id']}' can only use lowercase letters, numbers, - and +")
            if prog["id"] in ids:
                errors.append(f"{where}: Workout ID '{prog['id']}' is used twice")
            ids.add(prog["id"])
        else:
            pending_auto.append((r, prog))
        programs.append(prog)

    # auto IDs for new workouts: <level>-<min>m-<focuses>-<n>, never colliding
    for r, prog in pending_auto:
        base = f"{LEVELS[prog['level'][0]]}-{prog['minutes_per_day']}m-{'+'.join(SLUG[f] for f in prog['focus'])}"
        n = 2
        while f"{base}-{n}" in ids:
            n += 1
        prog["id"] = f"{base}-{n}"
        ids.add(prog["id"])

    if warnings:
        print("Heads up:")
        for w in warnings:
            print(f"  - {w}")
    if errors:
        print("\nFix these in the workbook, save it, and try again:")
        for e in errors:
            print(f"  ✗ {e}")
        sys.exit(1)

    combos: dict[tuple, int] = {}
    for p in programs:
        key = (p["level"][0], p["minutes_per_day"], tuple(p["focus"]))
        combos[key] = combos.get(key, 0) + 1
    print(f"OK  {len(programs)} workouts · {len(lib)} drills in library · {sum(1 for v in combos.values() if v >= 2)}/{len(combos)} combos have 2+ workouts")
    if pending_auto:
        print(f"    {len(pending_auto)} new workout(s): " + ", ".join(p["id"] for _, p in pending_auto))
    if check:
        print("(--check: nothing written)")
        return
    OUT.write_text(json.dumps({"version": 3, "programs": programs}, separators=(",", ":")))
    if builder.resolve() != ARCHIVE.resolve():
        shutil.copy2(builder, ARCHIVE)
    print(f"    wrote {OUT}")


if __name__ == "__main__":
    main()
