const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function main() {
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const index = pinecone.index('courtiq-brain');

  const knowledge = [

    // ─── PNR PASSING: DROP / CONTAIN COVERAGE ─────────────────────────

    {
      id: 'pnr-pass-drop-001',
      text: 'When the defense plays drop coverage in pick and roll — the ball handler\'s defender stays attached and the screener\'s defender sags back to contain — a passing window opens for the short roll. As the help defender retreats toward the basket, the screener can catch the ball in the short roll area between the free throw line and the paint. Recognize the big sagging back as your cue to deliver the short roll pass.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'pnr-pass-drop-002',
      text: 'Defenders know the short roll pass is a popular read in drop coverage. The big will often sag back and keep his hands low to take away the bounce pass to the short roll. When you see the defender\'s hands down cutting off the bounce pass, throw the pass over the top of the defender to your big instead. If the bounce pass is not open, the over-the-top pass is always the counter.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'pnr-pass-drop-003',
      text: 'The over-the-top pass to the roller does not require an athletic big who can dunk alley-oops. The concept is the same for any big man — if the bounce pass window is closed because the defender has his hands low, throw it over him. The big just needs to catch it above the defender and finish. This works at every level of basketball.',
      metadata: { category: 'general', play_type: 'pick and roll' }
    },

    // ─── PNR PASSING: CLOSING THE DISTANCE ────────────────────────────

    {
      id: 'pnr-pass-distance-001',
      text: 'When passing to the roller in pick and roll, the ball handler must close the distance between himself and the big defender before making the decision. If the big is all the way back in the paint, the ball handler needs to attack him and get as close as possible before throwing the pass. Passing from too far away gives the defense time to recover and take away the window.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },

    // ─── PNR PASSING: TAG DEFENDER AND SHAKE PASS ─────────────────────

    {
      id: 'pnr-pass-tag-001',
      text: 'In pick and roll, the tag defender is the backside help defender whose job is to help on the roller. Before throwing the short roll pass, the ball handler must locate the tag man. If the tag defender is hugged up to his own man and not helping on the roll, the pass to the roller is open. If the tag defender leaves his man to help on the roll, kick it to the tag man\'s man — this is called the shake pass.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'pnr-pass-tag-002',
      text: 'The shake pass in pick and roll happens when the tag defender comes in to help on the roller. As the ball handler comes off the screen, it looks like the short roll pass is open, but the tag man slides over to take it away. The ball handler reads this movement and throws the shake pass back to the tag man\'s man for a catch and shoot three. This read happens extremely fast — the ball handler must anticipate it, not react to it.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'pnr-pass-tag-003',
      text: 'The pick and roll passing decision tree after coming off the screen is: (1) look at the short roll — is it open? (2) locate the tag defender — is he helping on the roll or staying home? If the tag helps, throw the shake pass to his man. If the tag stays, throw it to the roller. This two-man read — roller and tag — is the foundation of every pick and roll passing decision.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },

    // ─── PNR PASSING: HEDGE COVERAGE ──────────────────────────────────

    {
      id: 'pnr-pass-hedge-001',
      text: 'When the defense hedges the pick and roll — the screener\'s defender comes up high to almost trap or double team the ball handler — the same passing reads still apply. You must locate the tag man and read whether he is helping on the roll or staying with his shake man. The hedge creates more pressure on the ball handler, but the read does not change.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'pnr-pass-hedge-002',
      text: 'Against a hard hedge in pick and roll, the ball handler should drag out the ball screen — pull the two defenders who are trapping him out into space away from the basket. This creates more room for the roller and forces the defense to cover more ground. After dragging it out, read the tag defenders. The top tag will usually go with his man on the shake, so focus on the bottom tag — if the roller gets inside of the bottom tag, he is open for a pass.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'pnr-pass-hedge-003',
      text: 'Dragging out the ball screen against a hedge means the ball handler deliberately pulls the two trapping defenders away from the basket into open space. This is not retreating — it is creating space. Once the defenders are pulled out, the roller has more room to operate and the passing windows become larger. The ball handler must be comfortable handling pressure while moving away from the basket.',
      metadata: { category: 'decision_making', play_type: 'pick and roll' }
    },

    // ─── PNR PASSING: CREATIVITY AND FILM ─────────────────────────────

    {
      id: 'pnr-pass-creative-001',
      text: 'When throwing the pass to the roll man in pick and roll, be creative with how you deliver the ball. Wrap-around passes, over-the-top passes, touch passes, and skip passes can all open up windows that do not look available at first glance. The best pick and roll passers make passes that look impossible because they use angles and timing that the defense does not expect.',
      metadata: { category: 'habit', play_type: 'pick and roll' }
    },
    {
      id: 'pnr-pass-film-001',
      text: 'The roll versus shake read in pick and roll happens very fast on the court. Watching film helps players learn to anticipate these reads before they happen. If you can recognize the tag defender\'s tendency on film, you can anticipate whether the roll or shake will be open before you even come off the screen. Film study makes split-second reads feel slower.',
      metadata: { category: 'general', play_type: 'pick and roll' }
    },

  ];

  console.log(`🏀 Seeding ${knowledge.length} PnR passing entries...`);

  let success = 0;
  let failed = 0;

  for (const item of knowledge) {
    try {
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: item.text
      });

      await index.upsert({
        records: [{
          id: item.id,
          values: embeddingResponse.data[0].embedding,
          metadata: { ...item.metadata, text: item.text }
        }]
      });

      console.log(`✅ ${item.id}`);
      success++;
    } catch (err) {
      console.error(`❌ ${item.id}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n🎉 Done! ${success} succeeded, ${failed} failed.`);
}

main().catch(console.error);
