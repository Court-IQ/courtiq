const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const multer = require("multer");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");

const upload = multer({ dest: "/tmp/", limits: { fileSize: 500 * 1024 * 1024 } }); // 500MB max



require("dotenv").config({ path: "../.env" });

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Admin Supabase client (service role — server only)
const adminSupabase = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.REACT_APP_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Ensure game-films bucket exists
if (adminSupabase) {
  adminSupabase.storage.createBucket('game-films', { public: false }).catch(() => {});
}

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

app.post("/api/analyze", async (req, res) => {
  try {
    const { frames, sessionName, position, playerName, jerseyNumber, playType, mode } = req.body;

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
    topK: 5,
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

    const analysisPrompt = `You are CourtIQ, an elite basketball coach and analyst with 20+ years of experience coaching high school and college players.

You are analyzing ${framesToAnalyze.length} sequential frames from a ${playType} by ${playerName || 'the focus player'}, Jersey #${jerseyNumber || 'unknown'}, playing ${position}.

STRICT RULES:
- Only describe what you can DIRECTLY SEE. No assumptions.
- Every statement must reference something visible in the- frames.
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
below 65 = D/F — fundamentally wrong play`;

    let response;

    if (mode === 'pro') {
      // GPT-4o for higher quality analysis
      response = await openaiClient.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 2000,
        messages: [
          {
            role: "system",
            content: "You are CourtIQ, an elite basketball film analyst. You analyze basketball video frames and return structured JSON analysis. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: [
              ...frameContents,
              { type: "text", text: analysisPrompt }
            ]
          }
        ]
      });
    } else {
      // Default to GPT-4o as well
      response = await openaiClient.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 2000,
        messages: [
          {
            role: "system",
            content: "You are CourtIQ, an elite basketball film analyst with 20+ years of coaching experience at the college level. You break down film with precision and give actionable feedback."
          },
          {
            role: "user",
            content: [
              ...frameContents,
              { type: "text", text: analysisPrompt }
            ]
          }
        ]
      });
    }

    const text = response.choices[0].message.content;
    console.log(`🔍 [${mode || 'standard'}] Raw response (first 500 chars):`, text?.slice(0, 500));

    if (!text) {
      console.log('⚠️ Empty response. Refusal:', response.choices[0].message.refusal || 'none');
    }

    const clean = (text || '').replace(/```json|```/g, "").trim();

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
        console.log('❌ Parse failed. Clean text:', clean?.slice(0, 300));
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

    // Search the Brain for relevant basketball knowledge
    let brainKnowledge = '';
    try {
      const chatEmbedding = await openaiClient.embeddings.create({
        model: 'text-embedding-ada-002',
        input: message
      });
      const brainResults = await brainIndex.query({
        vector: chatEmbedding.data[0].embedding,
        topK: 5,
        includeMetadata: true
      });
      brainKnowledge = brainResults.matches
        .filter(m => m.score > 0.75)
        .map(m => m.metadata.text)
        .join('\n\n');
      console.log('🧠 Chat brain hits:', brainResults.matches.length, 'above threshold:', brainKnowledge ? 'yes' : 'no');
    } catch(e) {
      console.log('Brain search failed for chat:', e.message);
    }

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

    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content: `You are CourtIQ, an elite personal basketball coach with 20+ years of experience coaching at the college level. You are talking directly to a player who wants to improve. You have deep knowledge of the game — spacing, gap theory, pick and roll reads, transition, court vision, defensive concepts, and shooting mechanics.

Here is their full film analysis history:
${analysisHistory}

${brainKnowledge ? `BASKETBALL KNOWLEDGE (use this to give expert-level answers):
${brainKnowledge}` : ''}

Rules:
- You are a real coach talking to your player. Be direct, specific, and honest — no fluff.
- When the player asks about a concept (like gap theory, horns, closeouts, etc.), teach it using the basketball knowledge provided. Explain it like you're drawing it up on a whiteboard.
- Reference specific details from their film analyses when relevant (habits, scores, verdicts, coaching tips)
- Spot patterns across multiple plays if they exist
- Keep responses conversational — 2-5 sentences unless they ask for a deeper breakdown
- If they ask about something you have basketball knowledge on, go deep. Use real terminology and real concepts.
- Give actionable advice they can use in their next game or workout`
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
    await brainIndex.upsert({
      records: [{
        id,
        values: embeddingResponse.data[0].embedding,
        metadata: { category: category || 'general', play_type: playType || '', verdict: verdict || '', text }
      }]
    });

    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/game-summary", async (req, res) => {
  try {
    const { sessionName, playerName, position, segments } = req.body;
    if (!segments || segments.length === 0) return res.status(400).json({ error: "No segments provided" });

    const segmentSummaries = segments.map((s, i) => {
      const sum = s.summary || {};
      return `--- Play ${i + 1}: ${s.playType} (${s.timeRange}) ---
Score: ${s.score}/100 | Grade: ${s.grade}
Offense: ${sum.positioning?.offense || 'N/A'}
Defense: ${sum.positioning?.defense || 'N/A'}
Shot Quality: ${sum.shotQuality?.verdict || 'N/A'} — ${sum.shotQuality?.reason || ''}
Decision: ${sum.decisionMaking?.verdict || 'N/A'} — ${sum.decisionMaking?.reason || ''}
Habit: ${sum.decisionMaking?.habit || 'N/A'}
Coaching Tip: ${sum.coachingTip || 'N/A'}`;
    }).join('\n\n');

    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1500,
      messages: [
        {
          role: "system",
          content: `You are CourtIQ, an elite basketball analyst. You are reviewing a full game's worth of play-by-play analyses for ${playerName || 'a player'}, playing ${position}.

Game: ${sessionName}
Total plays analyzed: ${segments.length}

Here are all the individual play analyses:
${segmentSummaries}

Based on ALL of these plays, generate a comprehensive game summary. Look for patterns across multiple plays — recurring habits, consistent strengths, repeated mistakes.

Return ONLY valid JSON, no markdown:
{
  "overallScore": 75,
  "overallGrade": "C+",
  "gameNarrative": "2-3 sentence overall assessment of game performance, referencing specific plays and patterns",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "patterns": ["pattern 1", "pattern 2"],
  "keyCoachingPoints": ["specific actionable tip 1", "specific actionable tip 2", "specific actionable tip 3"]
}`
        },
        {
          role: "user",
          content: "Generate the full game summary based on the play analyses above."
        }
      ]
    });

    const text = response.choices[0].message.content;
    const clean = text.replace(/```json|```/g, "").trim();

    let result;
    try {
      result = JSON.parse(clean);
    } catch (e) {
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) {
        result = JSON.parse(match[0].replace(/[\u0000-\u001F]+/g, " ").replace(/,\s*}/g, "}").replace(/,\s*]/g, "]"));
      } else {
        result = {
          overallScore: Math.round(segments.reduce((s, seg) => s + seg.score, 0) / segments.length),
          overallGrade: "C",
          gameNarrative: "Game summary could not be generated. See individual play analyses below.",
          strengths: [],
          weaknesses: [],
          patterns: [],
          keyCoachingPoints: [],
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

    result.overallGrade = getGrade(result.overallScore || 70);

    res.json({ success: true, result });
  } catch (err) {
    console.error("Game summary error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── USAGE ───────────────────────────────────────────────────────

const PLAN_LIMITS = { free: 999999, pro: 999999, elite: 999999 };

// Get or create user profile
async function getProfile(userId) {
  let { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (!data) {
    await supabase.from('profiles').insert([{ id: userId, plan: 'free', analyses_used: 0, analyses_reset_date: new Date().toISOString() }]);
    ({ data } = await supabase.from('profiles').select('*').eq('id', userId).single());
  }
  // Reset monthly count if needed
  const resetDate = new Date(data.analyses_reset_date);
  const now = new Date();
  if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
    await supabase.from('profiles').update({ analyses_used: 0, analyses_reset_date: now.toISOString() }).eq('id', userId);
    data.analyses_used = 0;
  }
  return data;
}

// Check if user can analyze
app.post("/api/check-usage", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "No userId" });
    const profile = await getProfile(userId);
    const limit = PLAN_LIMITS[profile.plan] || 2;
    res.json({
      plan: profile.plan,
      used: profile.analyses_used,
      limit,
      canAnalyze: profile.analyses_used < limit,
    });
  } catch (err) {
    console.error("Check usage error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Increment usage after analysis
app.post("/api/increment-usage", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "No userId" });
    const profile = await getProfile(userId);
    await supabase.from('profiles').update({ analyses_used: profile.analyses_used + 1 }).eq('id', userId);
    res.json({ success: true, used: profile.analyses_used + 1 });
  } catch (err) {
    console.error("Increment usage error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── ADMIN ANALYTICS ─────────────────────────────────────────────

const ADMIN_ID = '4b1e31f7-6366-440b-896f-ef858d9fdec2';

app.post("/api/admin/stats", async (req, res) => {
  try {
    const { userId } = req.body;
    if (userId !== ADMIN_ID) return res.status(403).json({ error: "Not authorized" });

    // Get all profiles
    const { data: profiles } = await supabase.from('profiles').select('*');

    // Get all analyses
    const { data: analyses } = await supabase.from('analyses').select('*').order('created_at', { ascending: false });

    // Get user emails via Supabase admin API
    let users = [];
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const adminSupabase = createClient(
        process.env.REACT_APP_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      const { data } = await adminSupabase.auth.admin.listUsers();
      users = data?.users || [];
    }

    // Merge data
    const userMap = {};
    (users || []).forEach(u => {
      userMap[u.id] = { email: u.email, created_at: u.created_at };
    });

    const profileList = (profiles || []).map(p => ({
      id: p.id,
      email: userMap[p.id]?.email || 'unknown',
      signed_up: userMap[p.id]?.created_at || p.created_at,
      plan: p.plan || 'free',
      analyses_used: p.analyses_used || 0,
      full_name: p.full_name || '',
      position: p.position || '',
      team_name: p.team_name || '',
    }));

    // Also include users who have analyses but no profile
    const profileIds = new Set(profileList.map(p => p.id));
    const analysisUserIds = [...new Set((analyses || []).map(a => a.user_id))];
    analysisUserIds.forEach(uid => {
      if (!profileIds.has(uid)) {
        profileList.push({
          id: uid,
          email: userMap[uid]?.email || 'unknown',
          signed_up: userMap[uid]?.created_at || null,
          plan: 'free',
          analyses_used: 0,
          full_name: '',
          position: '',
          team_name: '',
        });
      }
    });

    // Count analyses per user
    const analysisCount = {};
    (analyses || []).forEach(a => {
      analysisCount[a.user_id] = (analysisCount[a.user_id] || 0) + 1;
    });
    profileList.forEach(p => {
      p.total_analyses = analysisCount[p.id] || 0;
    });

    // Today's stats
    const today = new Date().toISOString().split('T')[0];
    const signupsToday = Object.values(userMap).filter(u => u.created_at && u.created_at.startsWith(today)).length;
    const analysesToday = (analyses || []).filter(a => a.created_at && a.created_at.startsWith(today)).length;

    res.json({
      totalUsers: profileList.length,
      totalAnalyses: (analyses || []).length,
      signupsToday,
      analysesToday,
      users: profileList.sort((a, b) => new Date(b.signed_up || 0) - new Date(a.signed_up || 0)),
      recentAnalyses: (analyses || []).slice(0, 20).map(a => ({
        session_name: a.session_name,
        player_name: a.player_name,
        play_type: a.play_type,
        score: a.score,
        grade: a.grade,
        created_at: a.created_at,
        user_id: a.user_id,
        email: userMap[a.user_id]?.email || 'unknown',
      })),
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── CHUNKED UPLOAD TO GEMINI ────────────────────────────────────
// Browser sends 5MB chunks → Railway forwards each to Gemini → never >5MB in RAM

const chunkSessions = new Map(); // sessionId → { uploadUrl, offset, mimeType, ...metadata }
const chunkUpload = multer({ dest: "/tmp/", limits: { fileSize: 10 * 1024 * 1024 } });

// Step 1: Init a Gemini resumable upload session
app.post("/api/chunk/init", async (req, res) => {
  const { fileSize, mimeType, sessionName, playerName, jerseyNumber, jerseyColor, position, userId } = req.body;
  try {
    const initRes = await fetch(
      `https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=resumable&key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Upload-Protocol": "resumable",
          "X-Goog-Upload-Command": "start",
          "X-Goog-Upload-Header-Content-Length": fileSize,
          "X-Goog-Upload-Header-Content-Type": mimeType || "video/mp4",
        },
        body: JSON.stringify({ file: { display_name: sessionName || "Game Film" } }),
      }
    );
    const uploadUrl = initRes.headers.get("x-goog-upload-url");
    if (!uploadUrl) throw new Error("Failed to create Gemini upload session");

    const sessionId = `${userId}-${Date.now()}`;
    chunkSessions.set(sessionId, {
      uploadUrl, offset: 0, mimeType: mimeType || "video/mp4",
      sessionName, playerName, jerseyNumber, jerseyColor, position, userId,
    });
    res.json({ success: true, sessionId });
  } catch (err) {
    console.error("Chunk init error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Step 2: Stream chunk directly from browser → Railway → Gemini with zero buffering.
// Body is NOT read into memory — req is piped straight to Gemini as a WHATWG ReadableStream.
// This bypasses every Railway/Cloudflare body-size limit because nothing is buffered.
app.post("/api/chunk/upload", async (req, res) => {
  const { sessionId, isLast } = req.query;
  const session = chunkSessions.get(sessionId);
  if (!session) return res.status(400).json({ error: "Invalid session — server may have restarted, please retry" });

  const contentLength = req.headers["content-length"];
  if (!contentLength) return res.status(400).json({ error: "Content-Length header missing" });

  try {
    const command = isLast === "true" ? "upload, finalize" : "upload";
    const { Readable } = require("stream");

    // Pipe req stream straight to Gemini — Railway never holds the video in memory
    const uploadRes = await fetch(session.uploadUrl, {
      method: "POST",
      headers: {
        "Content-Length": contentLength,
        "X-Goog-Upload-Offset": session.offset,
        "X-Goog-Upload-Command": command,
        "Content-Type": session.mimeType,
      },
      body: Readable.toWeb(req),
      duplex: "half",
    });

    session.offset += parseInt(contentLength);

    if (isLast === "true") {
      const fileData = await uploadRes.json();
      const fileName = fileData?.file?.name;
      chunkSessions.delete(sessionId);
      if (!fileName) throw new Error("Gemini finalize failed — no file name returned");

      const { sessionName, playerName, jerseyNumber, jerseyColor, position, userId } = session;
      runAutoAnalysisFromFile({ fileName, sessionName, playerName, jerseyNumber, jerseyColor, position, userId })
        .catch(err => console.error("Analysis failed:", err));

      res.json({ success: true, status: "processing" });
    } else {
      res.json({ success: true, offset: session.offset });
    }
  } catch (err) {
    console.error("Chunk upload error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── URL-BASED ANALYSIS ──────────────────────────────────────────
// Railway fetches the video from a URL (Google Drive, Dropbox, etc.)
// and pipes it straight to Gemini. No body size limit because this is
// an outgoing request FROM Railway, not an incoming upload TO Railway.
app.post("/api/auto-analyze/from-url", async (req, res) => {
  const { videoUrl, sessionName, playerName, jerseyNumber, jerseyColor, position, userId } = req.body;
  if (!videoUrl) return res.status(400).json({ success: false, error: "No videoUrl provided" });

  // Convert Google Drive share links — use newer usercontent domain which handles large files
  let directUrl = videoUrl;
  const driveMatch = videoUrl.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  const driveFileId = driveMatch ? driveMatch[1] : null;
  if (driveFileId) {
    directUrl = `https://drive.usercontent.google.com/download?id=${driveFileId}&export=download&authuser=0&confirm=t`;
  }
  if (videoUrl.includes('dropbox.com') && videoUrl.includes('dl=0')) {
    directUrl = videoUrl.replace('dl=0', 'dl=1');
  }

  // Respond immediately — analysis runs in background
  res.json({ success: true, status: "processing" });

  const db = adminSupabase || supabase;

  // Save status row immediately so frontend has something to poll
  let statusId = null;
  try {
    const { data: statusRow, error: insertErr } = await db.from("analyses").insert({
      session_name: sessionName, player_name: playerName, jersey_number: jerseyNumber,
      position, play_type: "game summary", score: 0, grade: "F",
      summary: { status: "Fetching video..." }, user_id: userId,
    }).select('id').single();
    if (insertErr) console.error("Status row insert error:", insertErr.message, insertErr.code, insertErr.details);
    statusId = statusRow?.id;
    console.log("Status row created:", statusId);
  } catch (e) {
    console.log("Could not create status row:", e.message);
  }

  const saveError = async (msg) => {
    console.error("from-url error:", msg);
    if (statusId) {
      await db.from("analyses").update({ summary: { error: msg } }).eq('id', statusId)
        .catch(e => console.error("saveError update failed:", e.message));
    } else {
      await db.from("analyses").insert([{
        session_name: sessionName, player_name: playerName, jersey_number: jerseyNumber,
        position, play_type: "game summary", score: 0, grade: "F",
        summary: { error: msg }, user_id: userId,
      }]).catch(e => console.error("saveError insert failed:", e.message));
    }
  };

  try {
    console.log("Fetching video from URL:", directUrl);

    const fetchController = new AbortController();
    const fetchTimeout = setTimeout(() => fetchController.abort(), 3 * 60 * 1000);
    let videoRes = await fetch(directUrl, { redirect: 'follow', signal: fetchController.signal });
    clearTimeout(fetchTimeout);

    if (!videoRes.ok) throw new Error(`Failed to fetch video (${videoRes.status}). Check the URL is publicly accessible.`);

    // If still getting HTML (old Drive domain fallback), try extracting confirm token
    const ct0 = videoRes.headers.get("content-type") || "";
    if (ct0.includes("text/html")) {
      const html = await videoRes.text();
      const confirmMatch = html.match(/confirm=([^&"]+)/);
      if (confirmMatch) {
        const confirmUrl = `https://drive.usercontent.google.com/download?id=${driveFileId}&export=download&confirm=${confirmMatch[1]}`;
        videoRes = await fetch(confirmUrl, { redirect: 'follow' });
      } else {
        throw new Error("Google Drive returned an HTML page instead of the video. Set sharing to 'Anyone with the link' and try again.");
      }
    }

    const contentLength = videoRes.headers.get("content-length");
    let contentType = videoRes.headers.get("content-type") || "video/mp4";
    // Google Drive often sends application/octet-stream — Gemini rejects that
    if (!contentType.startsWith("video/")) contentType = "video/mp4";
    const sizeMB = contentLength ? Math.round(contentLength / 1024 / 1024) : "unknown";
    console.log(`Got video: ${contentType}, ${sizeMB}MB`);

    if (statusId) {
      await db.from("analyses").update({ summary: { status: `Uploading ${sizeMB}MB to Gemini...` } }).eq('id', statusId).catch(() => {});
    }

    const initRes = await fetch(
      `https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=resumable&key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Upload-Protocol": "resumable",
          "X-Goog-Upload-Command": "start",
          ...(contentLength && { "X-Goog-Upload-Header-Content-Length": contentLength }),
          "X-Goog-Upload-Header-Content-Type": contentType,
        },
        body: JSON.stringify({ file: { display_name: sessionName || "Game Film" } }),
      }
    );
    const uploadUrl = initRes.headers.get("x-goog-upload-url");
    if (!uploadUrl) {
      const body = await initRes.text();
      throw new Error(`Gemini rejected the upload session: ${body.slice(0, 200)}`);
    }

    const uploadController = new AbortController();
    const uploadTimeout = setTimeout(() => uploadController.abort(), 25 * 60 * 1000);
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        ...(contentLength && { "Content-Length": contentLength }),
        "X-Goog-Upload-Command": "upload, finalize",
        "X-Goog-Upload-Offset": "0",
        "Content-Type": contentType,
      },
      body: videoRes.body,
      duplex: "half",
      signal: uploadController.signal,
    });
    clearTimeout(uploadTimeout);

    const fileData = await uploadRes.json();
    const fileName = fileData?.file?.name;
    if (!fileName) throw new Error(`Gemini upload failed: ${JSON.stringify(fileData).slice(0, 200)}`);

    console.log("Uploaded to Gemini:", fileName);
    if (statusId) {
      await db.from("analyses").update({ summary: { status: "Gemini is watching your film..." } }).eq('id', statusId).catch(() => {});
    }

    await runAutoAnalysisFromFile({ fileName, sessionName, playerName, jerseyNumber, jerseyColor: jerseyColor || "unknown", position, userId, statusId });
  } catch (err) {
    const msg = err.name === "AbortError" ? "Timed out fetching video — check your URL is publicly accessible" : err.message;
    await saveError(msg);
  }
});

// ─── SUPABASE STORAGE UPLOAD ─────────────────────────────────────

// Generate a signed URL so the browser can upload directly to Supabase (bypasses Railway)
app.post("/api/storage/upload-url", async (req, res) => {
  try {
    const { fileName, userId } = req.body;
    if (!adminSupabase) return res.status(500).json({ error: "Storage not configured" });

    const filePath = `${userId}/${Date.now()}-${fileName.replace(/\s/g, '_')}`;
    const { data, error } = await adminSupabase.storage
      .from("game-films")
      .createSignedUploadUrl(filePath);

    if (error) throw error;
    res.json({ success: true, signedUrl: data.signedUrl, path: data.path, token: data.token });
  } catch (err) {
    console.error("Upload URL error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Trigger analysis from a file already in Supabase Storage
app.post("/api/auto-analyze/from-storage", (req, res) => {
  const { filePath, mimeType, sessionName, playerName, jerseyNumber, jerseyColor, position, userId } = req.body;
  if (!filePath) return res.status(400).json({ error: "No filePath provided" });

  res.json({ success: true, status: "processing" });

  runAutoAnalysisFromStorage({ filePath, mimeType, sessionName, playerName, jerseyNumber, jerseyColor: jerseyColor || "unknown", position, userId })
    .catch(err => console.error("Storage auto-analysis failed:", err));
});

async function runAutoAnalysisFromStorage({ filePath, mimeType, sessionName, playerName, jerseyNumber, jerseyColor, position, userId }) {
  try {
    // 1. Get a signed download URL from Supabase
    const { data: urlData, error: urlError } = await adminSupabase.storage
      .from("game-films")
      .createSignedUrl(filePath, 3600);
    if (urlError) throw urlError;

    // 2. Download from Supabase as a stream
    console.log("⬇️  Streaming from Supabase...");
    const downloadRes = await fetch(urlData.signedUrl);
    if (!downloadRes.ok) throw new Error("Failed to download from Supabase");
    const contentLength = downloadRes.headers.get("content-length");
    const contentType = mimeType || downloadRes.headers.get("content-type") || "video/mp4";

    // 3. Create Gemini resumable upload session
    const initRes = await fetch(
      `https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=resumable&key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Upload-Protocol": "resumable",
          "X-Goog-Upload-Command": "start",
          "X-Goog-Upload-Header-Content-Length": contentLength,
          "X-Goog-Upload-Header-Content-Type": contentType,
        },
        body: JSON.stringify({ file: { display_name: sessionName || "Game Film" } }),
      }
    );
    const uploadUrl = initRes.headers.get("x-goog-upload-url");
    if (!uploadUrl) throw new Error("Failed to create Gemini upload session");

    // 4. Stream from Supabase directly to Gemini — Railway holds only a small buffer
    console.log("📤 Streaming to Gemini...");
    const geminiUploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Length": contentLength,
        "X-Goog-Upload-Offset": "0",
        "X-Goog-Upload-Command": "upload, finalize",
        "Content-Type": contentType,
      },
      body: downloadRes.body,
      duplex: "half",
    });
    const fileData = await geminiUploadRes.json();
    const fileName = fileData?.file?.name;
    if (!fileName) throw new Error("Gemini upload failed — no file name returned");

    // 5. Wait for Gemini to process + run analysis
    await runAutoAnalysisFromFile({ fileName, sessionName, playerName, jerseyNumber, jerseyColor, position, userId });

    // 6. Clean up Supabase file
    await adminSupabase.storage.from("game-films").remove([filePath]).catch(() => {});

  } catch (err) {
    console.error("runAutoAnalysisFromStorage error:", err);
    if (userId) {
      await supabase.from("analyses").insert([{
        session_name: sessionName, player_name: playerName,
        jersey_number: jerseyNumber, position, play_type: "game summary",
        score: 0, grade: "F", summary: { error: err.message }, user_id: userId,
      }]).catch(() => {});
    }
  }
}

// ─── AUTO ANALYSIS (Gemini 2.5 Flash) ────────────────────────────

// Step 1: Browser requests a direct upload session to Google (Railway never touches the video)
app.post("/api/auto-analyze/init", async (req, res) => {
  try {
    const { mimeType, fileSize, sessionName } = req.body;

    const initResponse = await fetch(
      `https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=resumable&key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Upload-Protocol": "resumable",
          "X-Goog-Upload-Command": "start",
          "X-Goog-Upload-Header-Content-Length": fileSize,
          "X-Goog-Upload-Header-Content-Type": mimeType || "video/mp4",
        },
        body: JSON.stringify({ file: { display_name: sessionName || "Game Film" } }),
      }
    );

    const uploadUrl = initResponse.headers.get("x-goog-upload-url");
    if (!uploadUrl) throw new Error("Failed to create Gemini upload session");

    res.json({ success: true, uploadUrl });
  } catch (err) {
    console.error("Upload init error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Step 2: Browser has uploaded file directly to Google, now run the analysis
app.post("/api/auto-analyze/run", (req, res) => {
  const { fileName, sessionName, playerName, jerseyNumber, jerseyColor, position, userId } = req.body;

  if (!fileName) return res.status(400).json({ error: "No fileName provided" });

  res.json({ success: true, status: "processing" });

  runAutoAnalysisFromFile({ fileName, sessionName, playerName, jerseyNumber, jerseyColor: jerseyColor || "unknown color", position, userId })
    .catch(err => console.error("Background auto-analysis failed:", err));
});

// Fallback: old route for direct server upload (kept for compatibility)
app.post("/api/auto-analyze", upload.single("video"), (req, res) => {
  const { sessionName, playerName, jerseyNumber, jerseyColor, position, userId } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ error: "No video file provided" });

  res.json({ success: true, status: "processing" });

  runAutoAnalysis({ file, sessionName, playerName, jerseyNumber, jerseyColor: jerseyColor || 'unknown color', position, userId })
    .catch(err => console.error("Background auto-analysis failed:", err));
});

async function runAutoAnalysis({ file, sessionName, playerName, jerseyNumber, jerseyColor, position, userId }) {
  const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

  try {
    // 1. Upload video to Gemini Files API
    console.log("📤 Uploading to Gemini Files API...");
    const uploadResult = await fileManager.uploadFile(file.path, {
      mimeType: file.mimetype || "video/mp4",
      displayName: sessionName || "Game Film",
    });

    // 2. Poll until Gemini finishes processing the video
    console.log("⏳ Waiting for Gemini to process video...");
    let geminiFile = await fileManager.getFile(uploadResult.file.name);
    let attempts = 0;
    while (geminiFile.state === "PROCESSING" && attempts < 60) {
      await new Promise((r) => setTimeout(r, 5000));
      geminiFile = await fileManager.getFile(uploadResult.file.name);
      attempts++;
    }

    if (geminiFile.state !== "ACTIVE") {
      throw new Error(`File processing failed. State: ${geminiFile.state}`);
    }

    // 3–5. Shared: Brain context + Gemini analysis + save to Supabase
    await analyzeAndSave({ geminiFile, geminiAI, sessionName, playerName, jerseyNumber, jerseyColor, position, userId });

    // 6. Clean up
    try { fs.unlinkSync(file.path); } catch (e) {}
    try { await fileManager.deleteFile(uploadResult.file.name); } catch (e) {}

    console.log(`✅ Auto-analysis complete`);

  } catch (err) {
    console.error("runAutoAnalysis error:", err);
    try { fs.unlinkSync(file.path); } catch (e) {}
    // Save error record so frontend stops polling
    if (userId) {
      await supabase.from("analyses").insert([{
        session_name: sessionName,
        player_name: playerName,
        jersey_number: jerseyNumber,
        position,
        play_type: "game summary",
        score: 0,
        grade: "F",
        summary: { error: err.message },
        user_id: userId,
      }]).catch(() => {});
    }
  }
}

// Shared: Brain context + Gemini prompt + save to Supabase
async function analyzeAndSave({ geminiFile, geminiAI, sessionName, playerName, jerseyNumber, jerseyColor, position, userId, statusId }) {
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

  // Pull Brain context from Pinecone
  let brainContext = '';
  try {
    const { Pinecone } = require('@pinecone-database/pinecone');
    const OpenAI = require('openai');
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const brainIndex = pinecone.index('courtiq-brain');
    const queryEmbedding = await openaiClient.embeddings.create({
      model: 'text-embedding-ada-002',
      input: `${position} basketball game analysis coaching positioning decision making shot quality`,
    });
    const brainResults = await brainIndex.query({
      vector: queryEmbedding.data[0].embedding,
      topK: 10,
      includeMetadata: true,
    });
    brainContext = brainResults.matches.map(m => m.metadata.text).join('\n\n');
    console.log('🧠 Brain context loaded:', brainContext.slice(0, 100));
  } catch (e) {
    console.log('Brain search failed, continuing without it:', e.message);
  }

  console.log("🏀 Gemini is watching the film...");
  const model = geminiAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `You are CourtIQ, an elite basketball coach and film analyst with 20+ years of experience.

Watch this ENTIRE game film. Find EVERY possession where the player wearing jersey #${jerseyNumber} actively handles the ball — catches a pass, dribbles, shoots, drives, or makes a key off-ball play worth analyzing.

Player info:
- Jersey: ${jerseyColor} #${jerseyNumber}
- Name: ${playerName || "the focus player"}
- Position: ${position}

IMPORTANT: Only track the player in the ${jerseyColor} #${jerseyNumber} jersey. If the opposing team also has a #${jerseyNumber}, ignore them — they will be wearing a different color.

BASKETBALL BRAIN CONTEXT (apply this expert knowledge to your analysis):
${brainContext || 'No additional context.'}

For EACH possession you find, provide a complete coaching analysis.

Scoring (be strict — high school players rarely score above 85):
93-100=A, 90-92=A-, 87-89=B+, 83-86=B, 80-82=B-, 77-79=C+, 73-76=C, 70-72=C-, 65-69=D+, 60-64=D, below 60=F

Play types to use ONLY: post move, mid-range jumper, 3 pointer, drive to basket, floater, pick and roll, fast break, catch and shoot, pull up jumper, defensive play

Return valid JSON:
{
  "plays": [
    {
      "startTime": "2:34",
      "endTime": "2:47",
      "playType": "drive to basket",
      "score": 78,
      "grade": "B-",
      "summary": {
        "positioning": {
          "offense": "Specific description of player position, footwork, body control. Reference court location.",
          "defense": "Where the defender is at the key moment, how close, any help defense."
        },
        "shotQuality": {
          "verdict": "GOOD SHOT or BAD SHOT",
          "reason": "Specific reason — defender distance, player balance, shot location.",
          "whatToDoInstead": "If BAD SHOT: what should they have done. If GOOD SHOT: what made it a good selection."
        },
        "decisionMaking": {
          "verdict": "RIGHT DECISION or WRONG DECISION",
          "reason": "What did the player read correctly or miss?",
          "habit": "One pattern or habit this player has — good or bad."
        },
        "coachingTip": "One specific actionable tip. Start with an action verb.",
        "drill": "Name a specific drill and explain how to run it to fix what you saw."
      }
    }
  ],
  "overallScore": 76,
  "overallGrade": "B-",
  "gameNarrative": "2-3 sentence overall assessment referencing specific patterns observed.",
  "strengths": ["specific strength 1", "specific strength 2"],
  "weaknesses": ["specific weakness 1", "specific weakness 2"],
  "keyCoachingPoints": ["actionable tip 1", "actionable tip 2", "actionable tip 3"]
}`;

  const geminiResult = await model.generateContent([
    { fileData: { fileUri: geminiFile.uri, mimeType: geminiFile.mimeType } },
    { text: prompt },
  ]);

  const analysis = JSON.parse(geminiResult.response.text());
  analysis.plays = (analysis.plays || []).map(p => ({ ...p, grade: getGrade(p.score || 70) }));
  analysis.overallGrade = getGrade(analysis.overallScore || 70);

  if (userId) {
    const db = adminSupabase || supabase;
    for (const play of analysis.plays) {
      await db.from("analyses").insert([{
        session_name: `${sessionName} (${play.startTime}-${play.endTime})`,
        player_name: playerName, jersey_number: jerseyNumber, position,
        play_type: play.playType, score: play.score, grade: play.grade,
        summary: play.summary, user_id: userId,
      }]);
    }
    const gameSummary = {
      session_name: sessionName, player_name: playerName,
      jersey_number: jerseyNumber, position, play_type: "game summary",
      score: analysis.overallScore, grade: analysis.overallGrade,
      summary: {
        gameNarrative: analysis.gameNarrative, strengths: analysis.strengths,
        weaknesses: analysis.weaknesses, keyCoachingPoints: analysis.keyCoachingPoints,
        plays: analysis.plays, overallScore: analysis.overallScore, overallGrade: analysis.overallGrade,
      },
      user_id: userId,
    };
    if (statusId) {
      await db.from("analyses").update(gameSummary).eq('id', statusId);
    } else {
      await db.from("analyses").insert([gameSummary]);
    }
  }

  console.log(`✅ analyzeAndSave complete: ${analysis.plays?.length} plays`);
}

// Used when browser uploads directly to Google — skips the file upload step
async function runAutoAnalysisFromFile({ fileName, sessionName, playerName, jerseyNumber, jerseyColor, position, userId, statusId }) {
  const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
  const db = adminSupabase || supabase;

  const updateStatus = async (status) => {
    if (statusId) {
      await db.from("analyses").update({ summary: { status } }).eq('id', statusId).catch(() => {});
    }
  };

  try {
    await updateStatus("Gemini is processing your video...");

    // Poll until file is ready
    console.log("⏳ Waiting for Gemini file to be ready:", fileName);
    let geminiFile = await fileManager.getFile(fileName);
    let attempts = 0;
    while (geminiFile.state === "PROCESSING" && attempts < 60) {
      await new Promise((r) => setTimeout(r, 5000));
      geminiFile = await fileManager.getFile(fileName);
      attempts++;
    }
    if (geminiFile.state !== "ACTIVE") throw new Error(`File not ready. State: ${geminiFile.state}`);

    await updateStatus("Analyzing every possession...");

    // Reuse the same analysis + save logic
    await analyzeAndSave({ geminiFile, geminiAI, sessionName, playerName, jerseyNumber, jerseyColor, position, userId, statusId });

    try { await fileManager.deleteFile(fileName); } catch (e) {}
  } catch (err) {
    console.error("runAutoAnalysisFromFile error:", err);
    if (statusId) {
      await db.from("analyses").update({ summary: { error: err.message } }).eq('id', statusId).catch(() => {});
    } else if (userId) {
      await db.from("analyses").insert([{
        session_name: sessionName, player_name: playerName, jersey_number: jerseyNumber,
        position, play_type: "game summary", score: 0, grade: "F",
        summary: { error: err.message }, user_id: userId,
      }]).catch(() => {});
    }
  }
}

app.get("/health", (req, res) => {
  res.json({ status: "CourtIQ backend is running!" });
});

app.listen(process.env.PORT || 3001, () => {
  console.log("✅ CourtIQ backend running on port", process.env.PORT || 3001);
});