# CourtIQ — Rork Build Brief

A paste-into-Rork spec for the mobile version of CourtIQ. Each section
is self-contained — drop it into Rork as-is when you're building that
piece. Sections are written for an AI builder, not a human PM, so the
language is dense and prescriptive on purpose.

---

## 1. PRODUCT OVERVIEW

CourtIQ is a basketball development app for high school and AAU players
(ages 14-22). The app helps players get better between practices through
three features: an AI coach they can ask anything, personalized 7-day
practice plans, and a game-by-game stats log with trends.

**Target user.** Serious HS / AAU / college basketball players who want
to improve. Secondary: skills trainers, parents.

**Tone.** Hooper-authentic, not corporate. Direct, occasionally blunt.
Real coach voice, not AI-assistant voice. No "great question!" prefixes.

**Anti-goals (don't build).**
- Login / sign-up for v1 (anonymous, local storage only).
- Video upload / film analysis (later phase, separate workstream).
- Social feed (not the product).

---

## 2. BRAND SYSTEM

### Colors

```
Background gradient:  linear top-to-bottom
  #0B1428  (deep navy, top + bottom)
  #152544  (lighter navy, middle 60%)

Accent / CTA:        #FF7A1A  (orange, primary action color)
Text white:          #FFFFFF
Text muted:          #9AB0CC  (slate blue for secondary text)
Text dim:            #6B7C95  (for hints, footnotes)

Success green:       #42D17C  (make, positive trend)
Error red:           #E55B5B  (miss, negative trend)
Card bg:             rgba(255,255,255,0.05) on the gradient
Card border:         rgba(255,255,255,0.10)
```

Buttons and active states use orange-500 → orange-400 gradient. Disabled
state is orange at 40% opacity.

### Typography

System font stack (SF Pro on iOS, Roboto on Android). Use weights:
400 (body), 600 (UI labels), 700 (buttons), 800-900 (headlines).

```
Display:    32-46pt, weight 800
Page H1:    28pt, weight 800
Section H2: 20pt, weight 700
Body:       16pt, weight 400
Label:      11pt, weight 700, ALL CAPS, letter-spacing 1.5px, orange
Caption:    12pt, weight 400, muted
```

### Spacing

4pt base. Use 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64. Outer padding on
screens: 16pt on iPhone, 24pt on iPad.

### Corner radii

12pt for cards, 16pt for input fields, 20pt for primary buttons, 24pt
for sheet modals.

### Voice rules

- No exclamation marks except in errors.
- No corporate AI phrases: avoid "I'd be happy to," "absolutely,"
  "great question."
- Use second person ("you," "your") not third.
- Sentence-case headings, not title-case.

---

## 3. INFORMATION ARCHITECTURE

### Tab bar (bottom, 4 tabs)

```
[ Home ]  [ Coach ]  [ Plan ]  [ Log ]
   ⌂        💬         📅        📊
```

Active tab uses orange icon + label. Inactive uses muted.

### Modal flows

- "Log new game" form pushes from Log tab as a modal sheet.
- Plan form is the default state of Plan tab (no modal).

### Deep links (later)

- `courtiq://chat` → Coach tab
- `courtiq://plan/new` → Plan tab, new plan
- `courtiq://log/new` → Log tab, log form open

---

## 4. SCREENS

### 4.1 HOME (`/`)

**Purpose:** Quick orient + entry points to other tabs. NOT a marketing
landing page (the web `/` is the marketing version — this is the
already-installed-user home).

**Layout, top to bottom:**

1. **Header** — CourtIQ wordmark (left) + a small settings gear (right,
   opens placeholder modal: "Settings coming soon")
2. **Greeting card** — "Yo, ready to work?" or similar. Rotates from a
   list of 5 hooper-tone greetings.
3. **Last action recap** — IF a plan exists OR games are logged, show
   "Day 3 of 7 in your plan" and/or "12 games logged, 14.2 PPG."
   If neither exists, show "Get started" with the three big CTAs below.
4. **Three big CTA cards** in a vertical stack:
   - **Ask your AI coach** → navigates to Coach tab
   - **Build a 7-day plan** → navigates to Plan tab
   - **Log a game** → opens Log new-game modal
5. **Footer text** — "v0.1 · made for hoopers"

Each CTA card is a tappable rounded rectangle with: an icon, a title,
a 1-line description, and a chevron right.

---

### 4.2 COACH (`/chat`)

**Purpose:** Free-form chat with an AI basketball coach.

**Layout:**

1. **Header** — "AI Coach" title, "Beta" badge
2. **Empty state** (no messages yet):
   - Big heading: "Ask your coach anything."
   - Subtitle: "Drills, game IQ, recruiting, off-season. Real talk."
   - 4 starter question chips that send the question on tap:
     - "How do I improve my catch-and-shoot range?"
     - "What's a good off-day workout?"
     - "How do I get coaches to notice me in AAU?"
     - "I'm a 6'1 combo guard — what should I focus on this summer?"
3. **Messages list** — scrollable. User messages right-aligned orange
   bubbles. AI messages left-aligned dark card bubbles. Streaming text
   types in character-by-character as it arrives.
4. **Input bar** (sticky bottom) — text input + Send button. Disabled
   while loading. Enter sends (Shift+Enter newline). Multiline expands
   up to ~4 lines.
5. **Below input**: tiny disclaimer text — "Beta. AI can be wrong —
   always trust your real coach over me."

**Behavior:**
- Messages persisted in AsyncStorage under key `courtiq:chat:history`.
- Conversation passed back to the API each turn (include full history).
- Streaming response — show typing dots until first chunk arrives.
- Long press a message bubble: copy to clipboard.
- Pull-to-clear: confirm "Clear chat?" → wipe storage.

**API:** see § 5.1 for the chat endpoint contract.

---

### 4.3 PLAN (`/plan`)

**Purpose:** Generate + track a personalized 7-day practice plan.

**Layout — empty state (no plan):**

1. Header "7-Day Plan"
2. Big heading "Build your week."
3. Form, 5 questions:
   - Position chip selector: 1/PG, 2/SG, 3/SF, 4/PF, 5/C, Combo guard, Combo forward
   - Level chip selector: HS JV, HS Varsity, AAU, JuCo/D3/NAIA, D1/D2, Pro/Overseas
   - Focus chip selector: Shooting, Ball handling, Finishing at the rim, Defense, Game IQ + film, Conditioning + athleticism
   - Minutes per day chip group: 15 / 30 / 45 / 60 / 90
   - Days per week chip group: 3 / 4 / 5 / 6 / 7
4. Primary button "Generate plan" (orange CTA)
5. Hint text: "Takes 5-15 seconds. Don't close."

**Layout — plan view (after generation):**

1. Top metadata strip: "YOUR PLAN · CREATED MAY 28"
2. Title from inputs: e.g. "Shooting · 1/PG"
3. Coach's one-line summary in italics (from the AI response)
4. Progress card: "3 of 7 days complete" + linear progress bar
5. List of 7 day cards, each with:
   - Day number + total minutes label (e.g. "DAY 1 · 45 MIN")
   - Day title (e.g. "Shooting + finishing")
   - Checkbox to mark complete (right side)
   - Warmup line
   - 2-4 drill cards inline, each showing: drill name, reps/time on the
     right, 1-3 sentence description
   - Cooldown line
6. Bottom button: "Start a new plan" (outlined, secondary)

**Behavior:**
- On generate: show full-screen loading state with the same orange
  spinner pattern as Chat. "Building your plan..."
- Persist `{ input, plan, completed: {1:true, 2:false, ...}, created_at }`
  to AsyncStorage under `courtiq:plan:current`.
- On reset: clear that key and return to form state.
- Tapping a day card expands/collapses drill details (use a smooth
  height animation).
- Checkbox tap haptic-feedback (light impact).

**API:** see § 5.2.

---

### 4.4 LOG (`/log`)

**Purpose:** Log box score per game, see season trends.

**Layout — empty state:**

1. Header "Game Log"
2. Big heading "Track every game."
3. Subtitle "Log your stats after each game. See trends, spot weaknesses,
   watch your numbers move."
4. Primary button "Log your first game"

**Layout — dashboard (games exist):**

1. Top metadata strip: "SEASON SUMMARY"
2. Headline "{N} games" + small "{W}W · {L}L" record
3. **Stat grid** — 6 small cards in a 3x2 grid:
   PTS, REB, AST, STL, BLK, TO (averages, 1 decimal)
   Each card shows the average + a trend arrow if 6+ games:
   - ↑ green if last-5 avg > prior-5 avg (or ↓ red if TO is up — that's bad)
   - ↓ red if last-5 avg < prior-5 avg
   - → gray if no meaningful change
4. **Shooting splits** — 3 cards if any shooting data: 2PT%, 3PT%, FT%
5. "GAMES" section header
6. List of game cards, newest first:
   - W/L pill chip (green/red)
   - "vs {Opponent}" + date + team-score
   - Big PTS number on the right + small "Xr / Ya" (rebounds/assists)
   - Tap to expand: shows full stat grid + notes + edit/delete buttons
7. **Sticky bottom button** "+ Log new game" (always visible above tab bar)

**New-game form (modal sheet):**

1. Header: "Log a game" + Cancel button (top-right)
2. Date picker + Opponent text input (2-column)
3. Win/Loss toggle (full-width 2-button row, green/red)
4. Team score / Opp score (2-column)
5. Stats grid (3-column): MIN, PTS, REB, AST, STL, BLK, TO — number inputs
   with numeric keypad
6. Collapsible "+ Add shooting splits" section: 2FG made/att, 3FG made/att,
   FT made/att
7. Collapsible "+ Add notes" section: multiline text
8. Save button (bottom, full-width, orange CTA)

**Behavior:**
- Persist array of game objects under `courtiq:log:games` (newest first).
- All numeric inputs use numeric keypad.
- Edit reopens form prefilled.
- Delete confirms via native action sheet.
- Trend math: compare avgs of newest 5 games to games 6-10.

---

## 5. LLM / API INTEGRATION

### 5.1 Chat endpoint

```
POST  https://courtiq.api/chat   (or whatever Rork backend route)
Body  { messages: [{ role: "user" | "model", content: string }] }
Returns  text/plain stream
```

Server calls Gemini 2.5 Flash with this system prompt (use verbatim):

> You are CourtIQ, an AI basketball coach. You talk to high school, AAU,
> and college players, parents, and trainers — but mostly players
> themselves.
>
> VOICE
> - Sound like a real coach who's been in the gym, not a corporate AI.
>   Direct, encouraging, occasionally blunt. Treat the player like an
>   athlete, not a customer.
> - Use real basketball language. "Get in your stance," "stay low on the
>   closeout," "use the rim as a defender." Never say things like "adopt
>   a defensive posture."
> - Short paragraphs. Hoopers don't read essays. Aim for 2-4 short
>   paragraphs.
> - No "great question!" hype intros. Just answer.
> - Don't end every response with a question back. Sometimes you just
>   give the answer and stop.
>
> WHAT YOU KNOW
> - Widely-accepted basketball concepts and drill categories.
> - Common position-specific demands (guards vs wings vs bigs).
> - Skill development, IQ, conditioning, mental game basics.
>
> WHAT YOU DON'T DO
> - DO NOT invent drill names. If you don't know a real named drill,
>   describe what the drill does without naming it. "A closeout-to-
>   contest drill" beats inventing "The X-3-7 Progression."
> - DO NOT make up player stats, team records, or NBA trivia.
> - DO NOT give medical, injury, mental-health, or nutrition-deficiency
>   advice. Redirect to the right professional.
> - DO NOT compare a player to an NBA star in a demotivating way. Use
>   comps to inspire, not to discourage.
>
> WHEN PUSHED
> - If a player frames a question wrong (e.g. "how do I dunk at 5'8"),
>   redirect to what's actually trainable.
> - If you don't know something, say so. "I'm not sure, but here's what
>   I'd do" is fine. Confidence without honesty is the AI failure mode
>   you avoid.
>
> CONTEXT
> - The player you're talking to is probably 15-22 years old, plays HS,
>   AAU, JuCo, or college ball, and is serious about their development.
> - They're using this app between practices, in their bedroom, on their
>   phone. Be efficient with their time.

Streaming config: temperature 0.7, max output tokens 1024.

### 5.2 Plan endpoint

```
POST  https://courtiq.api/plan
Body  {
  position: string,
  level: string,
  focus: string,
  minutes_per_day: number,
  days_per_week: number
}
Returns  application/json
```

Response schema:

```typescript
{
  summary: string;   // one-sentence coach summary of the week
  days: Array<{
    day_number: number;        // 1-7
    title: string;             // e.g. "Shooting + finishing"
    warmup: string;            // 1-2 sentences
    drills: Array<{
      name: string;            // descriptive, not a fake brand name
      description: string;     // 1-3 sentences with form cues
      reps_or_time: string;    // "3 sets of 10", "50 makes", "8 min"
    }>;
    cooldown: string;          // 1-2 sentences
    total_minutes: number;     // should ≤ minutes_per_day
  }>;
}
```

System prompt (use verbatim — same constraints as chat coach, plus plan
formatting rules):

> You are CourtIQ, an AI basketball development coach. You generate
> personalized 7-day practice plans for high school, AAU, and college
> players.
>
> VOICE: same as the coach (direct, hooper-authentic, no corporate AI
> phrases).
>
> PLAN RULES
> - 7 days, in order. Days 1-7.
> - Some days should be lighter or active-recovery if user picks 6-7
>   days/week.
> - Each day MUST fit within the user's stated time budget
>   (minutes_per_day).
> - Each day has a brief warmup, 2-4 main drills, and a brief cooldown.
> - Total of all drills + warmup + cooldown for a day should equal
>   roughly the user's minutes_per_day.
>
> DRILL DESCRIPTIONS
> - Be SPECIFIC. "100 form shots, 50 from each elbow, no dribble" beats
>   "shooting drill."
> - Include reps/sets/time for every drill.
> - Never invent a drill name. If you don't know a real named drill,
>   describe what it does without naming it.
> - Tailor to the user's position and focus.
>
> LEVELS
> - HS JV / weekend warrior → simpler drills, more reps fewer variations
> - HS varsity / AAU → standard drills, some 1-on-1 game-speed elements
> - College → high-intensity, game-speed, multiple skills combined per
>   drill
>
> OUTPUT
> - Return ONLY valid JSON matching the response schema. No prose. No
>   markdown fences. No commentary.

Temperature 0.7. Use Gemini's responseSchema feature for guaranteed JSON.

### 5.3 Environment variables

```
GEMINI_API_KEY        required, get from aistudio.google.com
```

---

## 6. DATA MODELS

All persistence is local — no backend DB for v1. Use AsyncStorage (or
MMKV for better perf).

```typescript
// AsyncStorage keys
"courtiq:chat:history"     → ChatMessage[]
"courtiq:plan:current"     → StoredPlan
"courtiq:log:games"        → Game[]
"courtiq:settings"         → { lastOpened: string }

type ChatMessage = {
  role: "user" | "model";
  content: string;
};

type StoredPlan = {
  input: {
    position: string;
    level: string;
    focus: string;
    minutes_per_day: number;
    days_per_week: number;
  };
  plan: { summary: string; days: Day[] };
  completed: { [day_number: number]: boolean };
  created_at: string;  // ISO
};

type Day = {
  day_number: number;
  title: string;
  warmup: string;
  drills: { name: string; description: string; reps_or_time: string }[];
  cooldown: string;
  total_minutes: number;
};

type Game = {
  id: string;             // crypto.randomUUID()
  date: string;           // YYYY-MM-DD
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
  fg2m?: number; fg2a?: number;
  fg3m?: number; fg3a?: number;
  ftm?: number;  fta?: number;
  notes?: string;
  created_at: string;     // ISO
};
```

---

## 7. NATIVE CAPABILITIES

### Required for v1

- **Haptics** — light impact on every primary button tap; success
  haptic when a game saves; medium impact when a day's checkbox is
  toggled.
- **Status bar** — light content on dark background, edge-to-edge.
- **Safe area** — respect notch/home indicator on all screens.
- **Keyboard handling** — input bar in Chat slides above keyboard.

### Nice-to-have, post-launch

- Push notifications ("Day 4 of your plan starts tomorrow")
- Share sheet ("Share your shot chart to Instagram")
- Apple Sign-In (when we add accounts)
- Health app integration (workout minutes)

---

## 8. APP STORE METADATA

### App name
**CourtIQ**

### Subtitle (30 char max)
**AI coach for basketball**

### Promotional text (170 char)
**Get your own AI basketball coach. Personalized 7-day workouts.
Track every game. Built by a hooper, for hoopers.**

### Description (paste this)

```
CourtIQ is the AI coach for serious basketball players.

ASK ANYTHING
Get real, specific answers from an AI coach trained to talk like a
real one. Drills, game IQ, recruiting, off-season planning — no
corporate AI fluff.

BUILD YOUR WEEK
Generate a personalized 7-day workout plan in seconds. Tailored to
your position, level, and what you want to work on. Check off days,
track progress.

LOG YOUR GAMES
Track every box score. See your trends — what's getting better,
what isn't. The numbers don't lie.

WHO IT'S FOR
HS, AAU, JuCo, and college players who actually want to get better.
Skills trainers. Serious parents.

WHO IT'S NOT FOR
Casual fans. Fantasy players. People looking for NBA news.

WHAT'S COMING
Game film upload + auto shot charts. Coming this season.

— Built by a D2 hooper. matthew@courtiq.app
```

### Keywords (100 char total, comma-separated)
```
basketball,hoops,training,workout,drills,scouting,AI coach,
shot chart,recruiting,AAU,HS basketball,Hudl,Synergy
```

### Category
Primary: **Sports**
Secondary: **Health & Fitness**

### Age rating
4+

### Icon spec
- 1024×1024 master
- Background: navy (#0B1428) with subtle radial gradient to (#152544)
- Foreground: orange (#FF7A1A) basketball outline OR the "CourtIQ" orange
  dot mark from the logo
- No text on the icon — pure mark

### Screenshots needed (6.7" iPhone, 1290×2796)

1. **Home screen** — three big CTA cards on the gradient
2. **Coach in action** — mid-conversation, showing a real response
3. **Plan generated** — Day 1 expanded with drill detail visible
4. **Game log dashboard** — stat trend cards + 3-4 logged games
5. **New game form** — partway filled

Each screenshot gets a 1-line tagline overlaid at the top in orange:
1. "Your basketball AI."
2. "Ask anything. Real coach voice."
3. "7 days, planned."
4. "See your game in numbers."
5. "Log it in under a minute."

---

## 9. EDGE CASES & ERRORS

- **Offline** — Coach: "You're offline — try again when you're back on."
  Plan: same. Log: works fully offline (all local).
- **Gemini API failure** — show "Coach is down — try again in a minute"
  in the message stream.
- **Empty input** — don't allow Send button to fire.
- **First run** — show a 3-screen intro (skippable):
  1. "Your AI basketball coach."
  2. "Plan your week. Crush it."
  3. "Track every game."
- **Plan generation slow** — after 8 sec, show a hint "Sometimes takes
  up to 20 sec — hang tight."
- **Log: deleting last game** — back to empty state, not blank
  dashboard.

---

## 10. LAUNCH CHECKLIST

Before submitting to App Store:

- [ ] Apple Developer enrollment complete
- [ ] App Store Connect listing created
- [ ] All 4 screens functional on physical iPhone (not just simulator)
- [ ] Test on iPhone SE (smallest screen) and iPhone Pro Max
- [ ] Empty states tested
- [ ] Offline behavior tested
- [ ] Privacy policy page (use [getterms.io](https://getterms.io) free
  generator)
- [ ] Support email: matthew@courtiq.app (or your Gmail)
- [ ] 5 screenshots uploaded
- [ ] App icon at 1024×1024
- [ ] First-run intro screens
- [ ] TestFlight build sent to 5-10 friends for feedback first
- [ ] Iterate based on feedback
- [ ] Submit for review (expect 1-7 days)

---

## END OF BRIEF

Workflow: open Rork, create the project, and for each new screen paste
the relevant § into the Rork prompt box. Sections 5 (API) and 6 (data
models) are universal — paste those early. Sections 4.1-4.4 are per
screen.

If Rork's AI generates something off-spec, paste the offending output
back here and we'll diagnose what spec it missed.
