import { GoogleGenAI, Type } from "@google/genai";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are CourtIQ, an AI basketball development coach.
You generate personalized 7-day practice plans for high school, AAU, and
college players.

VOICE
- Speak like a real coach. Direct, specific, occasionally blunt. No fluff.
- Hooper language. "Get reps from the elbow" not "perform repetitions from
  the elbow zone."

PLAN RULES
- 7 days, in order. Days 1-7.
- Some days should be lighter or active-recovery if user picks 6-7 days/week.
- Each day MUST fit within the user's stated time budget (minutes_per_day).
- Each day has a brief warmup, 2-4 main drills, and a brief cooldown.
- Total of all drills + warmup + cooldown for a day should equal roughly the
  user's minutes_per_day.

DRILL DESCRIPTIONS
- Be SPECIFIC. "100 form shots, 50 from each elbow, no dribble" beats
  "shooting drill."
- Include reps/sets/time for every drill.
- Never invent a drill name. If you don't know a real named drill, describe
  what it does without naming it. ("A closeout-to-contest progression" beats
  "The X-3-7 Drill.")
- Tailor to the user's position and focus. A guard with shooting focus gets
  more guard-shooting work than a big with post focus.

LEVELS
- HS JV / weekend warrior → simpler drills, more reps fewer variations
- HS varsity / AAU → standard drills, some 1-on-1 game-speed elements
- College → high-intensity, game-speed, multiple skills combined per drill

OUTPUT
- Return ONLY valid JSON matching the response schema. No prose. No
  markdown fences. No commentary.`;

type PlanInput = {
  position: string;
  level: string;
  focus: string;
  minutes_per_day: number;
  days_per_week: number;
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description:
        "One sentence summarizing the week's focus, written like a coach talking to the player.",
    },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day_number: { type: Type.INTEGER },
          title: {
            type: Type.STRING,
            description:
              "Short title for the day, e.g. 'Shooting + Finishing' or 'Active Recovery'",
          },
          warmup: {
            type: Type.STRING,
            description: "1-2 sentence warmup description with a time/rep count.",
          },
          drills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: {
                  type: Type.STRING,
                  description:
                    "Descriptive name. NEVER invent named drills — use a description like 'Catch-and-shoot from 5 spots' instead.",
                },
                description: {
                  type: Type.STRING,
                  description:
                    "1-3 sentences of how to do it, including form cues.",
                },
                reps_or_time: {
                  type: Type.STRING,
                  description:
                    "Explicit volume: '50 makes', '3 sets of 10', '8 min', etc.",
                },
              },
              required: ["name", "description", "reps_or_time"],
              propertyOrdering: ["name", "description", "reps_or_time"],
            },
          },
          cooldown: {
            type: Type.STRING,
            description: "1-2 sentence cooldown / stretch description.",
          },
          total_minutes: { type: Type.INTEGER },
        },
        required: [
          "day_number",
          "title",
          "warmup",
          "drills",
          "cooldown",
          "total_minutes",
        ],
        propertyOrdering: [
          "day_number",
          "title",
          "warmup",
          "drills",
          "cooldown",
          "total_minutes",
        ],
      },
    },
  },
  required: ["summary", "days"],
  propertyOrdering: ["summary", "days"],
};

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Server missing GEMINI_API_KEY" },
      { status: 500 }
    );
  }

  let input: PlanInput;
  try {
    input = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    !input.position ||
    !input.level ||
    !input.focus ||
    !input.minutes_per_day ||
    !input.days_per_week
  ) {
    return Response.json(
      { error: "Missing one of: position, level, focus, minutes_per_day, days_per_week" },
      { status: 400 }
    );
  }

  const userPrompt = `Generate a 7-day basketball development plan.

Player info:
- Position: ${input.position}
- Level: ${input.level}
- Main focus this week: ${input.focus}
- Time available per day: ${input.minutes_per_day} minutes
- Days they can train this week: ${input.days_per_week}

If days_per_week is less than 7, the remaining days should be rest days or
active recovery (light stretch, film study, light jog). Mark them clearly.

Tailor the drills to the position and focus. Keep total_minutes per day at or
under ${input.minutes_per_day}.`;

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
      return Response.json(
        { error: "Empty response from model" },
        { status: 502 }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return Response.json(
        { error: "Model returned invalid JSON", raw: text },
        { status: 502 }
      );
    }

    return Response.json(parsed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
