const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function main() {
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const index = pinecone.index('courtiq-brain');

  const knowledge = [

    // ─── SHOOTING: RELEASE TYPES ──────────────────────────────────────

    {
      id: 'shoot-release-001',
      text: 'There are three main types of release on a jump shot: the index finger release, the middle finger release, and the split finger release. Which one works best depends on personal preference, but it is critical to know which release you use because shooting with the wrong one leads to poor results.',
      metadata: { category: 'general', play_type: '3 pointer' }
    },
    {
      id: 'shoot-release-index-001',
      text: 'The index finger release means your index or pointer finger is the finger in the center of the ball guiding it toward the basket. On the release, your index finger finishes pointing down toward the ground while the other three fingers face up slightly. This is called the one down three up method. Avoid the four fingers down cookie jar release because it creates too much wrist tension and makes it hard to get a clean snap on the ball.',
      metadata: { category: 'positioning', play_type: '3 pointer' }
    },
    {
      id: 'shoot-release-middle-001',
      text: 'The middle finger release is the same concept as the index finger release except the middle finger is in the center of the ball instead. The middle finger releases the ball last and guides it toward the basket. This is the release that Steph Curry and Klay Thompson use. It is popular with smaller players and younger players. The middle finger finishes pointing down with the other fingers up slightly — one down three up.',
      metadata: { category: 'positioning', play_type: '3 pointer' }
    },
    {
      id: 'shoot-release-split-001',
      text: 'The split finger release is a combination of the index and middle finger releases. You make a V with your index and middle fingers and place the center of that V in the center of the ball. Instead of releasing with one finger, you release with two fingers through that V or fork shape. The two release fingers finish pointing down and the other two fingers face up slightly.',
      metadata: { category: 'positioning', play_type: '3 pointer' }
    },

    // ─── SHOOTING: ALIGNMENT PRINCIPLE ────────────────────────────────

    {
      id: 'shoot-release-alignment-001',
      text: 'The key to all three release types is that the dominant finger or fingers must be in the center of the basketball. If your release finger is in the center of the ball, the shot comes off straight and in alignment. If your release finger is off to the side, the ball comes off to the side and out of alignment, causing misses left or right. Alignment starts with finger placement on the ball.',
      metadata: { category: 'positioning', play_type: '3 pointer' }
    },
    {
      id: 'shoot-release-alignment-002',
      text: 'When diagnosing why a shooter is missing left or right consistently, check their release finger placement. If the dominant finger — whether index, middle, or the split V — is not centered on the ball, the shot will drift to one side. Correcting finger placement in the center of the ball is often the fastest fix for left-right misses.',
      metadata: { category: 'habit', play_type: '3 pointer' }
    },

    // ─── SHOOTING: WRIST AND SNAP ─────────────────────────────────────

    {
      id: 'shoot-release-snap-001',
      text: 'A common mistake is the four fingers down cookie jar release where all four fingers finish pointing at the ground after the shot. This creates too much wrist tension at the top of the shot and makes it difficult to get a clean snap on the basketball. Instead, use the one down three up method — the dominant release finger points down while the other three fingers stay up slightly. This reduces tension and allows a smoother, more natural release.',
      metadata: { category: 'habit', play_type: '3 pointer' }
    },

  ];

  console.log(`🏀 Seeding ${knowledge.length} shooting release entries...`);

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
