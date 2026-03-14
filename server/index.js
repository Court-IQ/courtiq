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

async function analyzeBasketballFrame(base64Frame, playerName, jerseyNumber, position, playType) {
  const response = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Frame}`
            }
          },
          {
            type: "text",
            text: `You are CourtIQ, an elite basketball coach and analyst with 20+ years of experience developing players at the college and professional level. Your job is to help players understand things about their game they cannot see themselves.

PLAY TYPE: ${playType} — focus your entire analysis on this specific type of play.
FOCUS PLAYER: ${playerName ? playerName : 'the primary ball handler'}, Jersey #${jerseyNumber || 'unknown'}, Position: ${position}.

Analyze this game film frame and give deep coaching feedback that teaches the player something they didn't already know. Return ONLY a JSON object, no extra text, no markdown:

{
  "positioning": {
    "offense": "describe exactly where the focus player is on the court and how their positioning is affecting the play. Are they in the right spot? Why or why not?",
    "defense": "describe the defensive situation the focus player is facing. What is the defense trying to take away?"
  },
  "shotQuality": {
    "verdict": "GOOD SHOT or BAD SHOT",
    "reason": "Don't just say if it's good or bad — explain the deeper basketball reason WHY. What does this shot choice reveal about the player's habits? What is the defense doing that the player is or isn't reading correctly?",
    "whatToDoInstead": "If it was a bad shot, explain exactly what the better option was and why it would have been more effective"
  },
  "decisionMaking": {
    "verdict": "RIGHT DECISION or WRONG DECISION",
    "reason": "Explain what the player was likely thinking and why that thinking is right or wrong from a basketball IQ standpoint. What did they miss? What should they have seen?",
    "habit": "Identify the underlying habit or tendency this decision reveals — good or bad."
  },
  "coachingTip": "Give one very specific, actionable coaching tip the player can work on in their next practice.",
  "drill": "Suggest one specific basketball drill by name that directly addresses the weakness or reinforces the strength shown in this play. Explain how to run it in 1-2 sentences.",
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

  try {
    return JSON.parse(clean);
  } catch(e) {
    try {
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) {
        const fixed = match[0]
          .replace(/[\u0000-\u001F]+/g, " ")
          .replace(/,\s*}/g, "}")
          .replace(/,\s*]/g, "]");
        return JSON.parse(fixed);
      }
    } catch(e2) {
      return {
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
}

app.post("/api/analyze", async (req, res) => {
  try {
    const { frames, sessionName, position, playerName, jerseyNumber, playType } = req.body;

    if (!frames || frames.length === 0) {
      return res.status(400).json({ error: "No frames provided" });
    }

    const framesToAnalyze = frames.slice(0, 1);
    const analyses = [];

    for (const frame of framesToAnalyze) {
      const analysis = await analyzeBasketballFrame(frame, playerName, jerseyNumber, position, playType);
      analyses.push(analysis);
    }

    const avgScore = Math.round(
      analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length
    );

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

    const summary = analyses[0];

    const result = {
      sessionName,
      position,
      playerName,
      jerseyNumber,
      playType,
      score: avgScore,
      grade: getGrade(avgScore),
      summary,
      createdAt: new Date().toISOString()
    };

    res.json({ success: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log("✅ CourtIQ backend running on port 3001"));