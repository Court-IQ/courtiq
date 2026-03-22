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

    const framesToAnalyze = frames.slice(0, 15);

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

    const playTypeCriteria = {
      'post move': `
- FOOTWORK: Are the pivot foot and drop step correct? Is the player creating separation or just backing down?
- BODY POSITION: Is the player sealing their defender with their body (hip into the defender's hip)? Low center of gravity?
- FINISH: Is the player going up strong, or off-balance? Shot fake used before going up?
- DEFENDER: How close is the help defense? Is the player reading the double team?`,
      'mid-range jumper': `
- SHOT CREATION: Did the player use a hesitation, shot fake, or pull-up to create space?
- FEET: Are feet set and squared to the basket at release, or fading/off-balance?
- DEFENDER: How much space between the shooter and the closest defender at release?
- LOCATION: Is this a high-efficiency mid-range (elbow, short corner) or a contested pull-up from a bad spot?`,
      '3 pointer': `
- CATCH AND FOOTWORK: Did the player catch in rhythm with feet ready, or did they need an extra gather step?
- BALANCE: Is the player square to the basket? Are they fading left/right or jumping forward?
- DEFENDER CLOSEOUT: How hard is the defender closing out? Did the player use a shot fake to draw them off their feet?
- SPACING: Is the player behind the line? Are teammates spacing the floor to create the open look?`,
      'drive to basket': `
- ATTACK ANGLE: Is the player driving to the paint or going baseline into help defense?
- FIRST STEP: Is the first step explosive, crossing the defender's foot?
- FINISH: Going up strong or getting blocked? Using the off hand, floater, or layup correctly based on defender position?
- READING HELP: Is the player reading the help defender — should they kick out, floater, or attack the rim?`,
      'floater': `
- TIMING: Is the floater triggered at the right moment — before the shot blocker can contest?
- RELEASE POINT: Is the player getting enough arc and releasing before contact with the big?
- APPROACH: Was the floater the right read, or did the player have a better option (kick out, pull up)?
- BODY CONTROL: Is the player balanced going into the floater or rushing it?`,
      'pick and roll': `
- READING THE SCREEN: Is the player reading how the defense is playing the pick? (hedge, drop, switch)
- DECISION: Did the player attack the right gap — pull up, drive, or kick to the roll man/corner?
- TIMING: Did the player use the screen at the right moment or go too early/late?
- SPACING: Are the other three players spaced properly to punish the defense?`,
      'fast break': `
- DECISION: 2-on-1 / 3-on-2 — did the player make the right choice to finish or pass?
- SPEED CONTROL: Is the player in control going into the break or too fast to finish cleanly?
- LANE SELECTION: Is the player running the correct lane — ball handler middle, wings wide?
- FINISH: Lay up, runner, or dish — did they pick the right shot based on the defender?`,
      'catch and shoot': `
- CATCH FOOTWORK: One-two step or hop? Are feet set before the catch or scrambling after?
- SHOT FAKE: Did the player use a shot fake if the defender was closing out hard?
- BODY BALANCE: Squared up? Any drift left or right at release?
- SPACING: Was this player in the right spot to receive the pass — open corner, wing?`,
      'pull up jumper': `
- CREATION: Did the player use a hesitation dribble, between-the-legs, or crossover to create space?
- BALANCE AT RELEASE: Are the feet set or is the player still moving? Jumping forward or straight up?
- SHOT SELECTION: Is this the right read based on defender position, or should the player have driven or passed?
- RHYTHM: Is this a one-dribble pull-up or did the player take too many dribbles, allowing the defense to recover?`,
      'defensive play': `
- STANCE: Is the player in a low defensive stance with active hands, or upright and flat-footed?
- POSITIONING: Correct help or on-ball positioning based on where the ball is?
- FOOTWORK: Drop step, slide step, or lunge — which did the player use and was it correct?
- CONTEST: On a shot contest — is the player going straight up or fouling? Close-out under control?`
    };

    const criteria = playTypeCriteria[playType] || `
- Footwork and balance
- Defender positioning and distance
- Decision making based on what the defense is giving
- Execution and body control`;

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
              text: `You are CourtIQ, an elite basketball coach and analyst with 20+ years of experience coaching high school and college players.

You are analyzing ${framesToAnalyze.length} sequential frames from a ${playType} by ${playerName || 'the focus player'}, Jersey #${jerseyNumber || 'unknown'}, playing ${position}.

STRICT RULES:
- Only describe what you can DIRECTLY SEE. No assumptions.
- Every statement must reference something visible in the frames.
- Be brutally honest. High school players should rarely score above 85.
- Your feedback must be specific to THIS play, not generic basketball tips.

WHAT TO LOOK FOR IN A ${playType.toUpperCase()}:
${criteria}

BASKETBALL BRAIN CONTEXT (apply this knowledge to your analysis):
${brainContext || 'No additional context.'}

ANALYSIS STEPS:
1. Trace the full sequence across frames — what happened from start to finish?
2. Identify the key moment (release, decision point, screen usage) and evaluate it
3. Note exactly where the closest defender is and how they're positioned
4. Identify one thing done well and one clear mistake
5. Give a coaching tip that directly addresses the mistake you saw

Return ONLY valid JSON, no markdown, no extra text:

{
  "positioning": {
    "offense": "2-3 sentences describing the player's position, footwork, and body control across the frames. Be specific — mention court location, stance, and how they moved.",
    "defense": "2-3 sentences describing where the defender(s) are, how close the primary defender is at the key moment, and whether help defense is visible."
  },
  "shotQuality": {
    "verdict": "GOOD SHOT or BAD SHOT",
    "reason": "Specific reason based on what you saw — defender distance, player balance, shot location, and release. Name what you see.",
    "whatToDoInstead": "If BAD SHOT: exactly what the player should have done based on the defensive positioning visible in the frames. If GOOD SHOT: what made it a good shot selection."
  },
  "decisionMaking": {
    "verdict": "RIGHT DECISION or WRONG DECISION",
    "reason": "What did the player read correctly or miss? Reference specific visible details — where was the open man, what was the defender doing?",
    "habit": "Based on this play, what is one pattern or habit this player seems to have — good or bad?"
  },
  "coachingTip": "One sentence, extremely specific to what you saw. Start with an action verb. Example: 'Square your left shoulder before releasing — you were fading right which killed your power on this jumper.'",
  "drill": "Name a specific drill (e.g. 'Mikan Drill', 'Chair Shooting', '1-on-1 Post') and explain in 2 sentences exactly how to run it to fix what you saw.",
  "score": 72,
  "grade": "C+"
}

SCORING — be strict, most high school plays score 60-82:
93-100 = A  — elite execution, near-perfect read and finish
87-92  = A-/B+ — very good play, only minor details to fix
80-86  = B/B- — solid play, one or two clear mistakes
73-79  = C+/C — average play, significant issues with execution or decision
65-72  = C-/D+ — poor execution or clearly wrong decision
below 65 = D/F — fundamentally wrong play`
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
      ? analyses.map((a, i) => {
          const s = a.summary || {};
          return `--- Analysis ${i + 1}: ${a.session_name} ---
Play: ${a.play_type || 'unknown'} | Position: ${a.position} | Player: ${a.player_name} #${a.jersey_number}
Score: ${a.score}/100 | Grade: ${a.grade}
Offense: ${s.positioning?.offense || 'N/A'}
Defense: ${s.positioning?.defense || 'N/A'}
Shot Quality: ${s.shotQuality?.verdict || 'N/A'} — ${s.shotQuality?.reason || ''}
Decision: ${s.decisionMaking?.verdict || 'N/A'} — ${s.decisionMaking?.reason || ''}
Habit: ${s.decisionMaking?.habit || 'N/A'}
Coaching Tip: ${s.coachingTip || 'N/A'}
Drill: ${s.drill || 'N/A'}`;
        }).join('\n\n')
      : 'No analyses yet.';

    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content: `You are CourtIQ, an elite personal basketball coach with 20+ years of experience. You are talking directly to a player who wants to improve.

Here is their full film analysis history:
${analysisHistory}

Rules:
- Reference specific details from their analyses (habits, drills, verdicts, coaching tips)
- Spot patterns across multiple plays if they exist
- Be direct and honest like a real coach — no fluff
- Keep it conversational, max 4 sentences unless they ask for more
- If they ask about a specific play type or area, pull from the relevant analysis`
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