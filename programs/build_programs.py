#!/usr/bin/env python3
"""
Read programs.xlsx (all sheets) and build programs.json.

Each sheet = one position's programs. The build merges all 5 sheets
into one JSON file the Rork app fetches.

Usage:
    python3 programs/build_programs.py
"""

from __future__ import annotations

import json
import sys
from collections import defaultdict
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent
SHEET = ROOT / "programs.xlsx"
OUT = ROOT.parent / "public" / "programs.json"

REQUIRED_COLUMNS = {
    "program_id", "program_title", "byline", "position", "level", "focus",
    "minutes_per_day", "days_per_week", "summary",
    "day_number", "day_title", "day_total_minutes",
    "drill_order", "drill_name", "drill_reps", "drill_description",
}
# drill_video_url is optional


def split_list(s) -> list[str]:
    if s is None:
        return []
    return [x.strip() for x in str(s).split(",") if x.strip()]


def parse_sheet(ws, sheet_name: str,
                by_prog: dict[str, dict],
                by_prog_day: dict[tuple, list],
                errors: list[str]) -> int:
    """Read one sheet's rows into the shared accumulators. Returns row count."""
    headers = [(cell.value or "").strip() for cell in ws[1]]
    missing = REQUIRED_COLUMNS - set(headers)
    if missing:
        errors.append(f"Sheet '{sheet_name}' missing columns: {missing}")
        return 0

    col_idx = {name: i for i, name in enumerate(headers)}
    rows_added = 0

    for row in ws.iter_rows(min_row=3, values_only=True):
        # Skip blank or header-only rows
        if not row or not row[col_idx["program_id"]]:
            continue

        r = {h: row[col_idx[h]] for h in headers if h}
        pid = str(r["program_id"]).strip()

        try:
            if pid not in by_prog:
                by_prog[pid] = {
                    "id": pid,
                    "title": str(r["program_title"] or "").strip(),
                    "byline": str(r["byline"] or "Coach Matthew").strip(),
                    "position": split_list(r["position"]),
                    "level": split_list(r["level"]),
                    "focus": split_list(r["focus"]),
                    "minutes_per_day": int(r["minutes_per_day"]),
                    "days_per_week": int(r["days_per_week"]),
                    "summary": str(r["summary"] or "").strip(),
                    "days": {},
                    "_sheet": sheet_name,
                }
            prog = by_prog[pid]

            day_num = int(r["day_number"])
            if day_num not in prog["days"]:
                prog["days"][day_num] = {
                    "day_number": day_num,
                    "title": str(r["day_title"] or "").strip(),
                    "total_minutes": int(r["day_total_minutes"]),
                }

            video_url = str(r.get("drill_video_url") or "").strip()
            by_prog_day[(pid, day_num)].append({
                "order": int(r["drill_order"]),
                "name": str(r["drill_name"] or "").strip(),
                "description": str(r["drill_description"] or "").strip(),
                "reps_or_time": str(r["drill_reps"] or "").strip(),
                "video_url": video_url if video_url else None,
            })
            rows_added += 1
        except (ValueError, TypeError, KeyError) as e:
            errors.append(f"Sheet '{sheet_name}' row with id '{pid}': {e}")

    return rows_added


def main() -> None:
    if not SHEET.exists():
        sys.exit(f"Missing {SHEET}. Run: python3 programs/_make_sheet.py")

    wb = openpyxl.load_workbook(SHEET, data_only=True)

    by_prog: dict[str, dict] = {}
    by_prog_day: dict[tuple, list] = defaultdict(list)
    errors: list[str] = []
    sheet_counts: dict[str, int] = {}

    for sheet_name in wb.sheetnames:
        ws = wb[sheet_name]
        added = parse_sheet(ws, sheet_name, by_prog, by_prog_day, errors)
        sheet_counts[sheet_name] = added
        print(f"  · '{sheet_name}': {added} drill rows")

    if errors:
        print("\nErrors:")
        for e in errors:
            print(f"  ✗ {e}")

    # Finalize programs: sort days + drills
    programs_out: list[dict] = []
    for pid, prog in by_prog.items():
        days_list = []
        for day_num in sorted(prog["days"].keys()):
            day = prog["days"][day_num]
            day_drills = sorted(by_prog_day[(pid, day_num)], key=lambda d: d["order"])
            for d in day_drills:
                d.pop("order")
            day["drills"] = day_drills
            days_list.append(day)
        prog["days"] = days_list
        prog.pop("_sheet", None)
        programs_out.append(prog)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"version": 1, "programs": programs_out}, indent=2))

    n_days = sum(len(p["days"]) for p in programs_out)
    n_drills = sum(len(d["drills"]) for p in programs_out for d in p["days"])
    print(f"\n✓ {len(programs_out)} programs · {n_days} days · {n_drills} drills")
    print(f"  → {OUT}")

    if errors:
        sys.exit(1)


if __name__ == "__main__":
    main()
