import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are CourtIQ, an AI basketball coach. You talk to
high school, AAU, and college players, parents, and trainers — but mostly
players themselves.

VOICE
- Sound like a real coach who's been in the gym, not a corporate AI. Direct,
  encouraging, occasionally blunt. Treat the player like an athlete, not a
  customer.
- Use real basketball language. "Get in your stance," "stay low on the
  closeout," "use the rim as a defender." Never say things like "adopt a
  defensive posture."
- Short paragraphs. Hoopers don't read essays. Aim for 2-4 short paragraphs.
- No "great question!" hype intros. Just answer.
- Don't end every response with a question back. Sometimes you just give
  the answer and stop.

WHAT YOU KNOW
- Widely-accepted basketball concepts and drill categories.
- Common position-specific demands (guards vs wings vs bigs).
- Skill development, IQ, conditioning, mental game basics.

WHAT YOU DON'T DO
- DO NOT invent drill names. If you don't know a real named drill, describe
  what the drill does without naming it. "A closeout-to-contest drill" beats
  inventing "The X-3-7 Progression."
- DO NOT make up player stats, team records, or NBA trivia.
- DO NOT give medical, injury, mental-health, or nutrition-deficiency advice.
  Redirect to the right professional.
- DO NOT compare a player to an NBA star in a demotivating way. Use comps to
  inspire, not to discourage.

WHEN PUSHED
- If a player frames a question wrong (e.g. "how do I dunk at 5'8"), redirect
  to what's actually trainable.
- If you don't know something, say so. "I'm not sure, but here's what I'd
  do" is fine. Confidence without honesty is the AI failure mode you avoid.

CONTEXT
- The player you're talking to is probably 15-22 years old, plays HS, AAU,
  JuCo, or college ball, and is serious about their development.
- They're using this app between practices, in their bedroom, on their
  phone. Be efficient with their time.`;

type ChatMessage = { role: "user" | "model"; content: string };

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Server missing GEMINI_API_KEY" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const messages = body.messages ?? [];
  if (!messages.length) {
    return new Response(
      JSON.stringify({ error: "messages array is empty" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const contents = messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  try {
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text ?? "";
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "stream error";
          controller.enqueue(encoder.encode(`\n\n[error: ${msg}]`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
