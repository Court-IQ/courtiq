const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function main() {
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const index = pinecone.index('courtiq-brain');

  const knowledge = [

    // ─── TRANSITION: EARLY PITCH AHEAD ────────────────────────────────

    {
      id: 'transition-pitch-001',
      text: 'The early pitch ahead is the key to fast transition offense. When somebody grabs a rebound, instead of pushing it themselves or starting the break with a dribble, they look for somebody running ahead of them to pitch it to. The ball always moves faster on a pass than on a dribble. That one early pitch ahead gets the ball in front of four out of five defenders, leaving only the safety back to stop the ball, which leads to easy layups.',
      metadata: { category: 'decision_making', play_type: 'fast break', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'transition-pitch-002',
      text: 'The discipline of the early pitch ahead means looking up the court for someone to throw it to before your feet even hit the ground after a rebound. On time on target passes in transition lead to easy run outs. A team can get the ball up the court in four seconds on one dribble by chaining pitch aheads — rebounder pitches to the first runner, that player takes one bounce and pitches to the next runner ahead of him.',
      metadata: { category: 'decision_making', play_type: 'fast break', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'transition-pitch-003',
      text: 'You do not need elite athletes to run good transition offense. Anybody can adopt the early pitch ahead philosophy just by having the discipline to look to throw the ball ahead instead of dribbling it up the court. Speed in transition is not just about how fast you run — it is about how fast you transition from defense to offense and how quickly you move the ball ahead with passes.',
      metadata: { category: 'general', play_type: 'fast break' }
    },

    // ─── TRANSITION: PRESSURE ON THE PAINT ────────────────────────────

    {
      id: 'transition-paint-001',
      text: 'Putting pressure on the paint in transition goes against the modern trend of running to the perimeter for three-pointers. Most teams have their guards run to the corners to space the court and shoot open threes. But attacking the rim in transition can be more effective — taking twos right at the rim instead of settling for transition threes. If a team does not shoot it great from three, they should not abandon transition but instead focus on attacking the paint.',
      metadata: { category: 'decision_making', play_type: 'fast break' }
    },
    {
      id: 'transition-paint-002',
      text: 'The key to pressure on the paint in transition is not just making the first shot — it is also getting offensive rebounds. Great transition teams get second chance makes off of transition misses. Crashing the boards after a transition attempt creates extra scoring opportunities and keeps the pressure on the defense.',
      metadata: { category: 'decision_making', play_type: 'fast break' }
    },
    {
      id: 'transition-paint-003',
      text: 'In transition, drive to the paint first to collapse the defense. If you do not have a layup, that is when you kick it out for a three. The three-pointers generated this way are mostly uncontested and in rhythm because the defense collapsed first. Focus on pressure on the paint first, then look for kick-out threes as the secondary option.',
      metadata: { category: 'decision_making', play_type: 'fast break', verdict: 'RIGHT DECISION' }
    },

    // ─── TRANSITION: LIVE BALL TURNOVERS ──────────────────────────────

    {
      id: 'transition-steals-001',
      text: 'Live ball turnovers are critical for transition offense. On a live ball steal, the offense immediately has an advantage — often a three on two or two on one — just from getting the steal. Because the defense is not set, the change of possession turns into easy points the other direction. If you want to be a good transition team, you have to be committed to getting stops and finding opportunities to get steals.',
      metadata: { category: 'decision_making', play_type: 'fast break' }
    },
    {
      id: 'transition-steals-002',
      text: 'Being active defensively creates transition opportunities. Live ball steals create numerical advantages that are nearly impossible for the defense to recover from. The key is not just the steal — it is anticipating the change of possession so that as soon as the ball is stolen, teammates are already running and the pitch ahead happens immediately. Active defense fuels transition offense.',
      metadata: { category: 'decision_making', play_type: 'fast break', verdict: 'RIGHT DECISION' }
    },

  ];

  console.log(`🏀 Seeding ${knowledge.length} transition offense entries...`);

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
