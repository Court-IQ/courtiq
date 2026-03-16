const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config({ path: "../.env" });

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

app.post("/api/analyze", async (req, res) => {
  try {
    const { frames, sessionName, position, playerName, jerseyNumber, playType } = req.body;

    if (!frames || frames.length === 0) {
      return res.status(400).json({ error: "No frames provided" });
    }

    const framesToAnalyze = frames.slice(0, 5);

    const frameContents = framesToAnalyze.map((frame, i) => ([
      {
        type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${frame}` }
      },
      {
        type: "text",
        text: `Frame ${i + 1} of ${framesToAnalyze.length}`
      }
    ])).flat();

    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: [
            ...frameContents,
            {
              type: "text",
              text: `You are CourtIQ, an elite basketball coach and analyst with 20+ years of experience developing players at the college and professional level. Your job is to help players understand things about their game they cannot see themselves.

You are being given ${framesToAnalyze.length} frames from a single play in chronological order.
PLAY TYPE: ${playType} — focus your entire analysis on this specific type of play.
FOCUS PLAYER: ${playerName ? playerName : 'the primary ball handler'}, Jersey #${jerseyNumber || 'unknown'}, Position: ${position}.

Analyze the FULL SEQUENCE of the play like a coach watching film. Look at how the play develops from start to finish. Return ONLY a JSON object, no extra text, no markdown:

{
  "positioning": {
    "offense": "how did the offensive positioning develop throughout the play? Was the focus player in the right spots?",
    "defense": "how did the defense react and adjust throughout the play? What were they trying to take away?"
  },
  "shotQuality": {
    "verdict": "GOOD SHOT or BAD SHOT",
    "reason": "based on the full sequence of the play, explain the deeper basketball reason WHY. What does this reveal about the player's habits?",
    "whatToDoInstead": "if it was a bad shot, what should have happened instead and why?"
  },
  "decisionMaking": {
    "verdict": "RIGHT DECISION or WRONG DECISION",
    "reason": "what decisions did the player make throughout the play and were they correct? What did they miss?",
    "habit": "what underlying habit or tendency does this play reveal — good or bad?"
  },
  "coachingTip": "one very specific actionable coaching tip the player can work on in their next practice",
  "drill": "one specific basketball drill by name that addresses what you saw. Explain how to run it in 1-2 sentences.",
  "score": 75,
  "grade": "B+"
}

Scoring: 93-100=A, 90-92=A-, 87-89=B+, 83-86=B, 80-82=B-, 77-79=C+, 73-76=C, 70-72=C-, below 70=D`
            }
          ]
        }
      ]
    });

    const text = response.choices[0].message.content;
    const clean = text.replace(/```json|```/g, "").trim();

    let summary;
    try {
      summary = JSON.parse(clean);
    } catch(e) {
      try {
        const match = clean.match(/\{[\s\S]*\}/);
        if (match) {
          const fixed = match[0]
            .replace(/[\u0000-\u001F]+/g, " ")
            .replace(/,\s*}/g, "}")
            .replace(/,\s*]/g, "]");
          summary = JSON.parse(fixed);
        }
      } catch(e2) {
        summary = {
          positioning: { offense: "Unable to parse", defense: "Unable to parse" },
          shotQuality: { verdict: "UNKNOWN", reason: "Analysis parsing failed", whatToDoInstead: "" },
          decisionMaking: { verdict: "UNKNOWN", reason: "Analysis parsing failed", habit: "" },
          coachingTip: "Please try again",
          drill: "Please try again",
          score: 70,
          grade: "C"
        };
      }
    }

    const getGrade = (score) => {
      if (score >= 93) return "A";
      if (score >= 90) return "A-";
      if (score >= 87) return "B+";
      if (score >= 83) return "B";
      if (score >= 80) return "B-";
      if (score >= 77) return "C+";
      if (score >= 73) return "C";
      return "C-";
    };

    const result = {
      sessionName,
      position,
      playerName,
      jerseyNumber,
      playType,
      score: summary.score || 70,
      grade: getGrade(summary.score || 70),
      summary,
      createdAt: new Date().toISOString()
    };

    res.json({ success: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3001, () => console.log("✅ CourtIQ backend running!"));