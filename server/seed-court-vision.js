const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function main() {
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const index = pinecone.index('courtiq-brain');

  const knowledge = [

    // ─── COURT VISION: DOWNHILL DECISION-MAKING ───────────────────────

    {
      id: 'court-vision-001',
      text: 'Court vision is not something you are born with — it is a learnable process called downhill decision-making. The goal of any offensive possession is to beat your man off the bounce and get downhill so you can draw defenders in. Once you get downhill, the decision-making process starts. There are many ways to get downhill — driving past your man is just one of them.',
      metadata: { category: 'decision_making', play_type: 'drive to basket' }
    },

    // ─── COURT VISION: HELP-SIDE DEFENDER (FIRST READ) ────────────────

    {
      id: 'court-vision-002',
      text: 'The most important thing once you get downhill is identifying the help-side defender — that is the first person you run into after getting past your man. If the help-side defender is late, the guard can score a layup. If the help-side defender is on time, trying to score over him usually results in a block or a miss due to the degree of difficulty. Unless you are playing a really low level of basketball, you will almost always have a help-side defender step up when you drive.',
      metadata: { category: 'decision_making', play_type: 'drive to basket' }
    },
    {
      id: 'court-vision-003',
      text: 'When you get downhill and engage the help-side defender, the goal is to pass it off to the guy who is now open — not try to shoot over the help. What happens way too often is the ball handler engages the help-side defender and instead of dishing it off, they try to shoot it and either get blocked or miss because of the degree of difficulty. Without predetermining, you need to anticipate finding the next open man.',
      metadata: { category: 'decision_making', play_type: 'drive to basket', verdict: 'WRONG DECISION' }
    },
    {
      id: 'court-vision-004',
      text: 'When driving and engaging the help-side defender, use ball fakes to freeze the help defender with his man. If the help defender stays home after the fake, you can score. If the help defender commits to you, dump it off for a layup. The ball fake keeps the defender guessing and gives you an extra split second to read the situation — fake one way, finish the other.',
      metadata: { category: 'decision_making', play_type: 'drive to basket', verdict: 'RIGHT DECISION' }
    },

    // ─── COURT VISION: CRACKBACK DEFENDER (SECOND READ) ───────────────

    {
      id: 'court-vision-005',
      text: 'When getting downhill and engaging the help-side defender, it is not a simple A or B decision of score or dump off. There is a third layer — the secondary help defender in the opposite corner, often called the crackback defender. After engaging the help-side defender, read what the crackback defender does. If the crackback takes away the pass to the big, the ball should go to the opposite corner for an open three. If the crackback stays in the corner, the big is open for a dump off.',
      metadata: { category: 'decision_making', play_type: 'drive to basket', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'court-vision-006',
      text: 'The downhill decision-making process has layers. First, engage the help-side defender. Second, read the crackback or secondary help defender. The crackback defender is responsible for guarding multiple players on the backside — typically the corner and the wing. He has a hard time deciding which one to cover, and the ball handler just has to determine which player is open based on what the crackback does.',
      metadata: { category: 'decision_making', play_type: 'drive to basket' }
    },

    // ─── COURT VISION: STRONG-SIDE CORNER HELP ────────────────────────

    {
      id: 'court-vision-007',
      text: 'There is one more layer to downhill decision-making. Sometimes the first decision comes from the strong-side corner with the gap defender, and the help-side defender becomes the second read instead of the first. This scenario is less common because most coaches do not like to help out of the strong-side corner, but it still happens. On the drive, the first decision is based on the help from one side and the second decision is based on help from the other side.',
      metadata: { category: 'decision_making', play_type: 'drive to basket' }
    },

    // ─── COURT VISION: OFF-BALL SPACING FOR PASSING ───────────────────

    {
      id: 'court-vision-008',
      text: 'Off-ball spacing is critical for court vision and passing. You want to occupy the corner and the wing so that the secondary crackback defender has a hard time deciding which player to cover. When two or three players are spread across the backside in the corner and wing spots, the crackback defender cannot guard all of them and someone will be open for a kick-out pass.',
      metadata: { category: 'positioning', play_type: 'drive to basket' }
    },

  ];

  console.log(`🏀 Seeding ${knowledge.length} court vision entries...`);

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
