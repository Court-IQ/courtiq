const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function main() {
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const index = pinecone.index('courtiq-brain');

  const knowledge = [

    // ─── HORNS: FORMATION AND SETUP ───────────────────────────────────

    {
      id: 'horns-setup-001',
      text: 'The horns formation has two bigs at lane line extended setting ball screens around the three-point line, two players in the dead corners, and the ball handler at the top. The ball handler chooses which screener to use. After the ball handler picks a side, that screener rolls to the rim, the other big shakes in behind, and the ball handler reads the back two defenders to determine where the pass goes.',
      metadata: { category: 'terminology', play_type: 'pick and roll' }
    },

    // ─── HORNS: PRIMARY AND SECONDARY READS ───────────────────────────

    {
      id: 'horns-read-001',
      text: 'In a horns set, the ball handler has two reads after coming off the ball screen. The primary read is the screener\'s defender — evaluate what he is doing. The secondary read is the back two defenders. If neither back defender covers the paint, the roll man is probably open and you need to find a way to get him the ball.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'horns-read-002',
      text: 'In horns, if the primary read — the screener\'s defender — continues to sink as you come off the ball screen and your own defender trails or goes over the top, you will have space to pull up for a mid-range jump shot or shoot a three off the screen. Read the depth of the big defender — if he drops, the pull-up is open.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'horns-read-003',
      text: 'When the primary read in horns hedges — the screener\'s defender comes over to help — that is a good thing because you now have an advantage. Get your eyes to the tag man. If the tag defender comes down to help on the roll, throw it back to the shake man for an open three. The defense has to scramble to recover when the ball goes from the ball handler to the shake.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },

    // ─── HORNS TWIST ──────────────────────────────────────────────────

    {
      id: 'horns-twist-001',
      text: 'Horns twist starts like regular horns — go off a ball screen, that man rolls to the rim — but instead of getting the standard roll and shake, the opposite big comes over and sets another ball screen sending the ball handler back to the other side. This creates a roll and replace action, also called a yo-yo. The first big rolls, the second big replaces behind him.',
      metadata: { category: 'terminology', play_type: 'pick and roll' }
    },
    {
      id: 'horns-twist-002',
      text: 'Horns twist has two advantages over regular horns. First, the false motion to one side creates a bigger gap — a double gap — to drive through on the twist back. In regular horns you drive through a single gap, but the twist opens up more space. Second, the twist creates confusion between the two tag defenders about who covers the roll and who covers the replace. That confusion creates open shots.',
      metadata: { category: 'decision_making', play_type: 'pick and roll' }
    },
    {
      id: 'horns-twist-003',
      text: 'Even if the defense communicates the roll and replace well on horns twist, they are still at a numbers disadvantage. They might account for the roller and the replace man, but they leave the backside player open for a skip pass. The twist forces the defense to solve multiple problems simultaneously, and they usually cannot cover everything.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'horns-twist-004',
      text: 'A wrinkle on horns twist: as the ball handler comes off the second screen, if the tag man gets caught staring at the ball, you can 45 cut the corner man to the basket for a layup or an alley-oop. This punishes ball-watching tag defenders and creates easy baskets at the rim.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'horns-twist-005',
      text: 'If your replace man in horns twist is not a shooter, he can still be effective. On the catch, he swings the ball to the wing and immediately goes into a ball screen. Now you have a cleared side ball screen off good action and the offense can flow for the rest of the possession. Non-shooters in the replace can create value through ball screening rather than just catching and shooting.',
      metadata: { category: 'decision_making', play_type: 'pick and roll' }
    },

    // ─── HORNS FLARE ──────────────────────────────────────────────────

    {
      id: 'horns-flare-001',
      text: 'Horns flare puts a guard at the top instead of two bigs. The ball handler uses the guard for the first screen, then a flare screen is set for that guard, and the five man goes into a ball screen. This creates different spacing where you have a roller and a shake from the perimeter. If the tag man helps on the roll, the ball goes to the shake man on the backside.',
      metadata: { category: 'terminology', play_type: 'pick and roll' }
    },
    {
      id: 'horns-flare-002',
      text: 'Horns flare creates problems for the defense because it removes one of the tag defenders from the equation. When the ball handler comes off the ball screen with two people guarding one and the big pops, there is only one defender left who cannot guard both the roller and the pop man. This forces the defense into an impossible situation.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'horns-flare-003',
      text: 'The flare in horns flare can also generate a double gap. The flare screen opens up one entire side of the court, and the ball handler can get straight downhill with very little resistance from the defense. Using the flare to clear space is just as valuable as using it to get the flare man open.',
      metadata: { category: 'positioning', play_type: 'pick and roll' }
    },

    // ─── HORNS: X-HORNS AND PRINCETON ELBOW ───────────────────────────

    {
      id: 'horns-x-001',
      text: 'X-horns is a variation where the four and five man cross as they go into their screening positions. It does not change the concept, but crossing the bigs can slow defenders getting to their ball screen coverage. Often that small delay is all you need to get an advantage, make two people guard one, and start the dominoes falling.',
      metadata: { category: 'terminology', play_type: 'pick and roll' }
    },
    {
      id: 'horns-princeton-001',
      text: 'The Princeton elbow concept out of horns throws the ball to the elbow or pinch post area instead of using a ball screen. From the pinch post entry, you can run a wide pin down on the opposite side to open a shooter off a curl or flare, or you can run a zoom action — a down screen followed by a dribble handoff from the five man. This gives the horns formation non-ball-screen options to keep the defense guessing.',
      metadata: { category: 'terminology', play_type: 'pick and roll' }
    },

  ];

  console.log(`🏀 Seeding ${knowledge.length} horns series entries...`);

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
