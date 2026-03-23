const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function main() {
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const index = pinecone.index('courtiq-brain');

  const knowledge = [

    // ─── SPACING: GAPS AND DRIVING LANES ──────────────────────────────

    {
      id: 'spacing-gaps-001',
      text: 'The ball handler always has two gaps they could potentially drive through. Gaps are the spaces between defenders created by the spacing of the offense. The wider the gaps, the easier it is to drive. Everything in basketball offense starts with understanding where the gaps are and how to attack them.',
      metadata: { category: 'positioning', play_type: 'drive to basket' }
    },
    {
      id: 'spacing-gaps-002',
      text: 'The baseline gap is the natural gap between the on-ball defender and the baseline. Players can drive baseline through this gap, and driving baseline typically opens up a lot of opportunities for layups and kick-out threes. Do not forget the baseline gap exists — it is always available as a driving lane.',
      metadata: { category: 'positioning', play_type: 'drive to basket' }
    },

    // ─── SPACING: FOUR OUT ONE IN ─────────────────────────────────────

    {
      id: 'spacing-41-001',
      text: 'Four out one in is the most common spacing in basketball today. It means four offensive players are around the perimeter and one offensive player is either in or near the paint. It has become popular because more players can shoot the three and it creates the maximum space for each gap. The gaps are big enough to drive through but there is usually a rim protector in the paint.',
      metadata: { category: 'positioning', play_type: 'general' }
    },

    // ─── SPACING: THREE OUT TWO IN ────────────────────────────────────

    {
      id: 'spacing-32-001',
      text: 'The old traditional three out two in look had a power forward and center both in the paint. The gaps between perimeter defenders are much bigger in this spacing, but there are two defenders in the paint stopping you from getting layups. Once you get to the paint it is more difficult to get an open shot because of all the help. The game has moved away from this spacing.',
      metadata: { category: 'positioning', play_type: 'general' }
    },

    // ─── SPACING: FIVE OUT ────────────────────────────────────────────

    {
      id: 'spacing-50-001',
      text: 'Five out spacing puts all five offensive players outside the perimeter with nobody in the paint. This creates wide open opportunities once you get to the lane to score, but there are much smaller gaps to drive through. It stretches the defense outside the paint, takes away a traditional rim defender, and if you can get through the first layer there are easy layups and kick-out threes available.',
      metadata: { category: 'positioning', play_type: 'general' }
    },

    // ─── SPACING: PERSONNEL AND DEFENSIVE PHILOSOPHY ──────────────────

    {
      id: 'spacing-personnel-001',
      text: 'Personnel impacts what gaps look like. If a corner offensive player is a great three-point shooter, the defense will guard him tightly and stay close. This naturally creates a bigger gap for the ball handler to drive through. Reading how the defense guards your teammates tells you where the gaps will be widest.',
      metadata: { category: 'decision_making', play_type: 'drive to basket', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'spacing-defense-philosophy-001',
      text: 'A defense\'s principles impact the size of the gaps. Some defenses have a philosophy of closing down gaps and giving ball handlers smaller gaps to drive through. The corner defender plays up the line to discourage driving. When a defense closes the gaps, the ball handler may have to settle for a tough three because there is nowhere to drive. This is the game within the game — defense trying to close gaps, offense trying to create gaps.',
      metadata: { category: 'decision_making', play_type: 'drive to basket' }
    },

    // ─── SPACING: CREATING GAPS WITH DHO ──────────────────────────────

    {
      id: 'spacing-dho-001',
      text: 'A dribble handoff or DHO is one way the offense can create gaps against a defense that closes them down. The dribble handoff creates confusion among defenders and opens up a wide open driving lane. If the defender is late recovering after the handoff, there is a large gap to drive through and the ball handler can get straight downhill for an easy layup.',
      metadata: { category: 'terminology', play_type: 'drive to basket' }
    },

    // ─── SPACING: GAPS IN PLAYS AND POST UPS ──────────────────────────

    {
      id: 'spacing-plays-001',
      text: 'Because teams are running plays, there is not always going to be standard four out one in perfect spacing throughout a possession. But gaps are always there. Even in post-up situations, when the ball goes into the post and two defenders guard one on the post entry, that creates extended gaps and wide open threes on the perimeter. Gaps exist in every formation and every action.',
      metadata: { category: 'positioning', play_type: 'general' }
    },

    // ─── SPACING: MISMATCH AND GAP INTERACTION ────────────────────────

    {
      id: 'spacing-mismatch-gap-001',
      text: 'When a ball screen creates a switch and a mismatch, the point guard knows he should be able to drive the gap against a bigger slower defender. But the defense also knows this — they will try to close the gap and make it impossible to get downhill. This is the chess match: the offense reads the gap, the defense adjusts to take it away, and the offense must counter. If the defense closes the gap too aggressively, the ball handler can shoot a step-back three instead of driving.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },

  ];

  console.log(`🏀 Seeding ${knowledge.length} spacing & gaps entries...`);

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
