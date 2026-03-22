const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function main() {
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const index = pinecone.index('courtiq-brain');

  const knowledge = [

    // ─── DRIVING: TWO LEVELS OF DEFENSE ─────────────────────────────

    {
      id: 'drive-levels-001',
      text: 'Every time you drive to the basket, there are always two levels of defense you must get past. The first level is the nearest help defender between you and the rim. The second level is deeper — usually a rim protector or weak side help. It does not matter if you are driving from the top of the key, the wing, or the corner — there is always a first level and a second level. Understanding this concept is one of the most important keys to playing high level basketball.',
      metadata: { category: 'decision_making', play_type: 'drive to basket' }
    },
    {
      id: 'drive-levels-002',
      text: 'When driving, you must keep your eyes up and locate both levels of defense. First, read the first level defender — is he in a position to help or not? If the first level is not in a position to help, keep driving. Then get your eyes to the second level. This is where most of the help comes from. You can do a lot of this work before you even start your drive by scanning the floor.',
      metadata: { category: 'decision_making', play_type: 'drive to basket', verdict: 'RIGHT DECISION' }
    },

    // ─── DRIVING: FIRST LEVEL READS ─────────────────────────────────

    {
      id: 'drive-first-001',
      text: 'When driving and the first level defender stunts at you — stepping into your path to slow you down — kick the ball to the perimeter immediately. It is extremely difficult for a defender to stunt and recover to his man on time. The perimeter shooter will have a rhythm three-pointer if you make this pass quickly. Do not try to drive through a stunt when the pass is open.',
      metadata: { category: 'decision_making', play_type: 'drive to basket', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'drive-first-002',
      text: 'On a wing drive, the first level read happens faster — often within one dribble. If the first level defender is sitting in the gap between you and the basket, make the easy pass to the corner immediately and trust your teammate. Do not try to force a drive through a defender who is already in the gap. The corner pass off a wing drive is one of the highest percentage plays in basketball.',
      metadata: { category: 'decision_making', play_type: 'drive to basket', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'drive-first-003',
      text: 'If neither the first level nor the second level defender commits to helping on your drive, finish at the basket. Do not pass up a layup to make a fancy play. When the defense does not rotate, take what they give you and score it.',
      metadata: { category: 'decision_making', play_type: 'drive to basket', verdict: 'RIGHT DECISION' }
    },

    // ─── DRIVING: SECOND LEVEL READS ────────────────────────────────

    {
      id: 'drive-second-001',
      text: 'The second level of defense on a drive typically has two defenders to read: the strong side defender who can slide in to help, and the backside defender who can come over to help. This is why keeping your eyes up while driving is critical — you must read both of these defenders in a short window and make the right decision.',
      metadata: { category: 'decision_making', play_type: 'drive to basket' }
    },
    {
      id: 'drive-second-002',
      text: 'When driving and the corner defender steps up from the second level to help, kick it to his man in the corner. When the rim protector steps up to help or block your shot, dump it off to his man under the basket. When neither second level defender commits, finish at the rim. These are the three options every time you reach the second level.',
      metadata: { category: 'decision_making', play_type: 'drive to basket', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'drive-second-003',
      text: 'Most big men want to block shots. When driving at a shot blocker in the second level, anticipate dumping it off to his man even if it is a tight window. The dump off pass to the roller or big man when the shot blocker commits is one of the most reliable plays in basketball. Most dunks in college and pro basketball come from guards making good second level reads.',
      metadata: { category: 'decision_making', play_type: 'drive to basket', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'drive-second-004',
      text: 'First level defenders on the perimeter usually do not want to leave their man because they do not want to give up a three-pointer. But the second level big almost always wants to block the shot. Anticipate this — when the big rotates over, his man is open under the basket for an easy dump off. Read the big, not the perimeter defender.',
      metadata: { category: 'decision_making', play_type: 'drive to basket', verdict: 'RIGHT DECISION' }
    },

    // ─── DRIVING: BASELINE DRIVES ───────────────────────────────────

    {
      id: 'drive-baseline-001',
      text: 'On a baseline drive from the corner, the first level defender is in the paint and will usually stop you. When the first level rotates over, the second level has to rotate and help too. If they do not help, dump it down to the open man under the basket. If the second level does help, kick it to the opposite side of the floor.',
      metadata: { category: 'decision_making', play_type: 'drive to basket', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'drive-baseline-002',
      text: 'On a baseline drive, pay attention to where the big defender\'s shoulders are facing. If the big never fully commits — his shoulders do not turn to you — he is not really helping and you should finish at the basket. If his shoulders turn to face you, he has committed and his man is open. Read the shoulders, not the feet.',
      metadata: { category: 'decision_making', play_type: 'drive to basket', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'drive-baseline-003',
      text: 'Most good defenses will help the helper on baseline drives. When you drive baseline and the first level steps up, the second level will often take away the easy dump down. In this case, kick the ball to the opposite side of the floor where the defense has rotated away from. The skip pass opposite on a baseline drive is a high value play.',
      metadata: { category: 'decision_making', play_type: 'drive to basket', verdict: 'RIGHT DECISION' }
    },

    // ─── DRIVING: BAD DECISIONS ─────────────────────────────────────

    {
      id: 'drive-bad-001',
      text: 'A player who drives into a collapsing defense — first level committed, second level rotating over — and still tries to score instead of passing is making a WRONG DECISION. Even when the dump off is wide open, many players force a tough shot because they want to score. This is a selfish play that kills possessions. The key to being great at driving is not doing something impressive once — it is making the right read possession after possession.',
      metadata: { category: 'decision_making', play_type: 'drive to basket', verdict: 'WRONG DECISION' }
    },
    {
      id: 'drive-bad-002',
      text: 'Driving with your head down and not seeing the help defense is a WRONG DECISION. If you cannot see the first and second level defenders while driving, you will make bad decisions — forcing shots into shot blockers, driving into help, and missing open teammates. Eyes up on every drive. Read the defense, do not just attack blindly.',
      metadata: { category: 'decision_making', play_type: 'drive to basket', verdict: 'WRONG DECISION' }
    },
    {
      id: 'drive-bad-003',
      text: 'A player who gets past the first level stunt and then ignores the second level shot blocker rotating over to try a tough layup — when the dump off is wide open — is making a WRONG DECISION. The blocked shot is entirely preventable. Anticipate the big rotating to block the shot and dump it off before he gets there.',
      metadata: { category: 'decision_making', play_type: 'drive to basket', verdict: 'WRONG DECISION' }
    },

    // ─── DRIVING: GENERAL PRINCIPLES ────────────────────────────────

    {
      id: 'drive-principle-001',
      text: 'The key to being great at driving is consistency, not highlight plays. Making the right read — pass or finish — every single possession is what separates good players from great ones. Take what the defense gives you. If they help, pass. If they do not, score. Do this possession after possession and you will pick apart any defense.',
      metadata: { category: 'general', play_type: 'drive to basket' }
    },
    {
      id: 'drive-principle-002',
      text: 'When driving, the process is always the same: (1) locate the first level of defense, (2) read if they help or stunt, (3) if you get past the first level, locate the second level, (4) read the second level — corner defender stepping up, rim protector stepping up, or neither committing. This process should become second nature through repetition.',
      metadata: { category: 'general', play_type: 'drive to basket' }
    },
    {
      id: 'drive-principle-003',
      text: 'Understanding the two levels of defense before you start your drive gives you confidence because you know what to expect. Scan the floor before driving. Identify where the first level defender is, where the second level help is, and which teammates are in position to receive a pass. Great drivers read the defense before they attack, not after.',
      metadata: { category: 'general', play_type: 'drive to basket' }
    },

  ];

  console.log(`🏀 Seeding ${knowledge.length} driving read entries...`);

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
