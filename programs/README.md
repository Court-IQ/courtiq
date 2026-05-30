# CourtIQ Programs

Hand-curated practice programs. No AI generation — these are the real
plans CourtIQ delivers.

## How this works

Three CSVs in this folder describe every program:

| File | What it holds |
|---|---|
| `programs.csv` | One row per program (metadata: position, level, focus, time, title) |
| `days.csv` | One row per day in each program (warmup, cooldown, total minutes) |
| `drills.csv` | One row per drill in each day (name, description, reps) |

When you run `build_programs.py`, those CSVs get joined and exported as
a single JSON file at `../public/programs.json`. Vercel serves that
JSON. The Rork iOS app fetches it on launch and caches.

## Workflow for adding/editing programs

1. **Open the CSVs in Excel, Numbers, or Google Sheets** (whatever you like).
2. **Edit.** Add a new program by:
   - Adding one row to `programs.csv` with a unique `id`
   - Adding 1-7 rows to `days.csv` (one per day) using the same `program_id`
   - Adding 2-4 rows to `drills.csv` per day (one per drill)
3. **Save as CSV** back to this folder. Don't change the column headers.
4. **Run the build** from the repo root:
   ```bash
   cd ~/courtiq
   python3 programs/build_programs.py
   ```
5. **Commit and push:**
   ```bash
   git add programs/ public/programs.json
   git commit -m "Add new program: <title>"
   git push
   ```
6. Vercel auto-deploys. The Rork app will pick up the new programs on next
   launch (or sooner if it re-fetches periodically).

## Column reference

### programs.csv

| Column | Notes |
|---|---|
| `id` | Unique kebab-case identifier, e.g. `pg-shoot-hs-45-5d`. Required. Don't change once published. |
| `position` | Comma-separated positions this fits. E.g. `1, Combo guard`. Match values to the form chips. |
| `level` | Comma-separated levels, e.g. `HS Varsity, AAU`. |
| `focus` | Comma-separated. Usually one: `Shooting`, `Ball handling`, etc. |
| `minutes_per_day` | Integer. Should match a value from the form chips: 15, 30, 45, 60, 90. |
| `days_per_week` | Integer 3-7. Should match form chip. |
| `title` | Display title. "Point Guard Shooting Series #1" |
| `byline` | "Coach Matthew" or attribution |
| `summary` | One sentence describing the week. Shown above the day list. |

### days.csv

| Column | Notes |
|---|---|
| `program_id` | Must match an `id` in programs.csv |
| `day_number` | 1-7 |
| `title` | "Form + Volume" — the day's theme |
| `warmup` | 1-2 sentences |
| `cooldown` | 1-2 sentences |
| `total_minutes` | Integer — your stated total time for this day |

### drills.csv

| Column | Notes |
|---|---|
| `program_id` | Match programs.csv |
| `day_number` | Match days.csv |
| `drill_order` | 1, 2, 3, 4 — order on the day |
| `name` | Descriptive, NOT branded ("Catch-and-shoot from 5 spots", not "The XYZ Drill") |
| `description` | 1-3 sentences with form cues |
| `reps_or_time` | Explicit volume: "50 makes", "3 sets of 10", "8 min" |

## Matching logic (how the app picks a program)

When a user fills out the plan form, the Rork app:

1. Filters programs where `position`, `level`, `focus`, `minutes_per_day`,
   and `days_per_week` all contain the user's selections
2. If multiple match → picks one (random rotation OR most recent — your call)
3. If no exact match → fall back to closest (e.g. ignore level mismatch first,
   then focus, then time)

You can also add a "Coach's pick" override: a column on `programs.csv` like
`featured` to surface specific programs.

## Target volume

- **Week 1:** 5 programs (you can do this in a day)
- **Week 4:** 20 programs (covering most reasonable user inputs)
- **Month 3:** 50+ programs (full coverage + variety)

Programs are durable assets. Once written, they generate revenue forever.
Each one you write makes the app better.

## Sanity check before pushing

After running `build_programs.py`, glance at `../public/programs.json`.
Look for `WARN:` messages in the script output — those mean a row
references an ID that doesn't exist. Common cause: typo in `program_id`.
