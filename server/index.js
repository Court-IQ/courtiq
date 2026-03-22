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

    const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const brainIndex = pinecone.index('courtiq-brain');


    let brainContext = '';
try {
  const queryEmbedding = await openaiClient.embeddings.create({
    model: 'text-embedding-ada-002',
    input: `${playType} ${position} basketball analysis`
  });
  const brainResults = await brainIndex.query({
    vector: queryEmbedding.data[0].embedding,
    topK: 3,
    includeMetadata: true
  });
  brainContext = brainResults.matches
    .map(m => m.metadata.text)
    .join('\n\n');
  console.log('🏀 Brain context found:', brainContext.slice(0, 100));
} catch(e) {
  console.log('Brain search failed, continuing without it:', e.message);
}



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
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            ...frameContents,
            {
              type: "text",
              text: `You are CourtIQ, an elite basketball coach and analyst with 20+ years of experience. You have coached at the high school and college level and specialize in player development for young athletes.

You are analyzing ${framesToAnalyze.length} frames from a ${playType} by ${playerName || 'the focus player'}, Jersey #${jerseyNumber || 'unknown'}, playing ${position}.

Study the FULL SEQUENCE carefully. Look at:
- Where the player starts and ends the play
- How defenders are positioned and rotating
- Whether the player reads the defense correctly
- Body positioning, footwork, and balance
- Spacing of teammates on the floor
- Whether the play type matches what the defense is giving them

Be BRUTALLY HONEST like a real coach watching film. Do not sugarcoat. High school players need real feedback to actually improve. If the shot was bad, say it was bad and explain exactly why. If the decision was wrong, say so.

Return ONLY valid JSON, no markdown, no extra text, no backticks:

{
  "positioning": {
    "offense": "specific description of offensive positioning throughout the full play sequence — where was the focus player, where were teammates, was the spacing good or bad?",
    "defense": "specific description of how the defense was set up and how they reacted — were they in help position, was the defender close, did they rotate correctly?"
  },
  "shotQuality": {
    "verdict": "GOOD SHOT or BAD SHOT",
    "reason": "deep basketball reason WHY based on what you see — defender position, shot location, shot type for this player's position, game situation awareness",
    "whatToDoInstead": "if it was a bad shot, exactly what should have been done instead and why would that have been better?"
  },
  "decisionMaking": {
    "verdict": "RIGHT DECISION or WRONG DECISION",
    "reason": "what did the player read correctly or miss? What information did they have available but ignore? What did they see that led to this decision?",
    "habit": "what does this play reveal about this player's tendencies — is this a good habit being reinforced or a bad habit that needs to be broken?"
  },
  "coachingTip": "one very specific actionable coaching tip this player can work on in their very next practice session — be specific, not generic",
  "drill": "one specific named basketball drill that directly addresses what you saw in this play. Explain exactly how to run it in 2 sentences so a high school player can do it alone or with a partner.",
  "score": 75,
  "grade": "B+"
}

BASKETBALL BRAIN KNOWLEDGE (use this to inform your analysis):
${brainContext}

Scoring guide — be honest, most high school plays should score between 60-85:
93-100 = A (elite play, professional level execution)
90-92 = A- (excellent play, minor improvements only)
87-89 = B+ (good play, solid execution with small mistakes)
83-86 = B (above average, did the right thing mostly)
80-82 = B- (decent play, some clear mistakes)
77-79 = C+ (average play, several things to fix)
73-76 = C (below average, significant issues)
70-72 = C- (poor execution, major mistakes)
below 70 = D or F (wrong decision or very poor execution)`
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
          positioning: { offense: "Unable to parse response", defense: "Unable to parse response" },
          shotQuality: { verdict: "UNKNOWN", reason: "Analysis parsing failed. Please try again.", whatToDoInstead: "" },
          decisionMaking: { verdict: "UNKNOWN", reason: "Analysis parsing failed. Please try again.", habit: "" },
          coachingTip: "Please try the analysis again",
          drill: "Please try the analysis again",
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
      if (score >= 70) return "C-";
      if (score >= 65) return "D+";
      if (score >= 60) return "D";
      return "F";
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
    console.error("CourtIQ API Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, analyses } = req.body;

    const analysisHistory = analyses && analyses.length > 0
      ? analyses.map((a, i) => 
          `Analysis ${i + 1}: ${a.session_name} | ${a.play_type} | ${a.position} | Score: ${a.score}/100 | Grade: ${a.grade} | Player: ${a.player_name} #${a.jersey_number}`
        ).join('\n')
      : 'No analyses yet.';

    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content: `You are CourtIQ, an elite personal basketball coach with 20+ years of experience coaching high school and college players. You are talking directly to a player who wants to improve their game.

Here is this player's analysis history:
${analysisHistory}

Use this data to give specific, personalized advice. Reference their actual scores, play types, and patterns you notice. Be encouraging but honest. Keep responses concise and actionable — like a real coach talking to a player, not a lecture. Use casual language. Max 3-4 sentences unless they ask for more detail.`
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    const reply = response.choices[0].message.content;
    res.json({ success: true, reply });

  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ success: false, reply: "Sorry, I couldn't process that. Try again!" });
  }
});

app.post("/api/brain", async (req, res) => {
  try {
    const { text, category, playType, verdict } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    const { Pinecone } = require('@pinecone-database/pinecone');
    const OpenAI = require('openai');
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const brainIndex = pinecone.index('courtiq-brain');

    const embeddingResponse = await openaiClient.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text
    });

    const id = `custom-${Date.now()}`;
    await brainIndex.upsert([{
      id,
      values: embeddingResponse.data[0].embedding,
      metadata: { category: category || 'general', play_type: playType || '', verdict: verdict || '', text }
    }]);

    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "CourtIQ backend is running!" });
});

app.listen(process.env.PORT || 3001, () => {
  console.log("✅ CourtIQ backend running on port", process.env.PORT || 3001);
});