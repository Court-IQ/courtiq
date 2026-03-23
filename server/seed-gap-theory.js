const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function main() {
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const index = pinecone.index('courtiq-brain');

  const knowledge = [

    // ─── GAP THEORY: FOUNDATION ───────────────────────────────────────

    {
      id: 'gap-foundation-001',
      text: 'The gap theory is the foundation of basketball offense. It is made up of three components: making two people guard one, winning closeouts, and creating mismatches. All three concepts work together throughout possessions to create what is referred to as poetry in motion. The best offenses seamlessly flow through these concepts. But none of it works without good spacing — spacing creates gaps, and gaps create offense.',
      metadata: { category: 'general', play_type: 'drive to basket' }
    },
    {
      id: 'gap-foundation-002',
      text: 'The three best shots in basketball in order of priority are: layups, free throws, and catch and shoot three-pointers. Every offensive concept should be built around getting these shots. The gap theory puts language and structure to what teams do naturally to produce these high-percentage opportunities.',
      metadata: { category: 'shot_quality', play_type: 'general' }
    },

    // ─── GAP THEORY: SPACING ──────────────────────────────────────────

    {
      id: 'gap-spacing-001',
      text: 'Five out spacing puts all five players around the perimeter — two in the corners, two on the wings, and one at the top of the key, with everybody outside the paint. The advantage is you typically have no defenders in the paint. The disadvantage is there is not a lot of space between defenders for driving. That is why five out offenses rely on a lot of passing and cutting — if everybody just stands still, there is nowhere to drive.',
      metadata: { category: 'positioning', play_type: 'general' }
    },
    {
      id: 'gap-spacing-002',
      text: 'Four out one in spacing has four players around the perimeter and one post player near the paint or the block. The advantage is you typically have more space to drive. The disadvantage is you usually have a rim protector in the paint on defense. This spacing creates bigger driving lanes but requires reading the help defender in the paint.',
      metadata: { category: 'positioning', play_type: 'general' }
    },
    {
      id: 'gap-spacing-003',
      text: 'A common problem is that guards do not get all the way to the corner. When somebody tries to drive, there is no space because the wings need to be all the way down in the corner to stretch defenders out and force them to make tough decisions. If you are standing on the wing instead of the corner, you are shrinking the driving gaps for your teammates and making the defense\'s job easier.',
      metadata: { category: 'positioning', play_type: 'general' }
    },
    {
      id: 'gap-spacing-004',
      text: 'A post player standing at the free throw line or in the middle of the paint clogs the driving lane. Even if the ball handler gets past their defender, there is nowhere to drive because their own teammate is in the way. Post players need to be in the room, the short corner, or the dunker spot — not standing in the middle of the paint taking away driving angles from their guards.',
      metadata: { category: 'positioning', play_type: 'general' }
    },
    {
      id: 'gap-spacing-bad-001',
      text: 'When spacing is bad — teammates standing above the free throw line next to each other, wings not in the corners, post players clogging the paint — a player who drives past their defender and draws help has nobody to pass to. This creates out of control turnovers, forced shots over multiple defenders, and wasted advantages. Without proper spacing, making two people guard one is useless because there is no open man to pass to.',
      metadata: { category: 'decision_making', play_type: 'drive to basket', verdict: 'WRONG DECISION' }
    },

    // ─── GAP THEORY: MAKING TWO GUARD ONE ─────────────────────────────

    {
      id: 'gap-two-guard-001',
      text: 'Making two people guard one is the foundation of the gap theory. If you can make two defenders guard one offensive player, mathematically somebody else has to be open — as long as you have good spacing. The ball handler drives into a gap, forces a help defender to step up, and now two defenders are guarding one player. The correct play is to pass to the open teammate, not shoot a difficult shot over multiple defenders.',
      metadata: { category: 'decision_making', play_type: 'drive to basket', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'gap-two-guard-002',
      text: 'When a player drives to the basket and draws all the help defenders but still tries to force a difficult shot instead of passing to a wide open teammate, that is a WRONG DECISION. Even if the shot goes in sometimes, the percentages are terrible. The correct play when two people guard one is to find the open man and get off the ball.',
      metadata: { category: 'decision_making', play_type: 'drive to basket', verdict: 'WRONG DECISION' }
    },
    {
      id: 'gap-two-guard-003',
      text: 'When driving and drawing help, you must play off two feet — stay balanced and under control so you can make the right read and the right pass. Players who drive off one foot out of control cannot see the floor, cannot make good decisions, and end up with turnovers or blocked shots. Stay on two feet, read the help, find the open man.',
      metadata: { category: 'decision_making', play_type: 'drive to basket', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'gap-two-guard-004',
      text: 'If you are a non-shooter, you can still space the floor by standing in the corner. When your teammate drives and your defender steps up to help, you cut to the basket as the help defender leaves. You will get a layup without ever needing to shoot a three. Non-shooters create spacing through cutting, not standing.',
      metadata: { category: 'positioning', play_type: 'drive to basket' }
    },

    // ─── GAP THEORY: WINNING CLOSEOUTS ────────────────────────────────

    {
      id: 'gap-closeout-001',
      text: 'Winning a closeout means successfully shooting, driving, or passing the basketball when a defender closes out on you. When the ball gets kicked to the perimeter after dribble penetration, the recovering defender is closing out — and the defense is at its most vulnerable. The offensive player must read the closeout and make the right play.',
      metadata: { category: 'decision_making', play_type: 'catch and shoot' }
    },
    {
      id: 'gap-closeout-002',
      text: 'When a defender closes out too aggressively — feet off the ground, momentum going toward the ball handler — it is nearly impossible for them to stay in front without fouling. The offensive player should drive past the closeout for a layup. When a defender is so far away they cannot contest the shot, the offensive player should shoot it. Read the closeout: aggressive closeout means drive, long closeout means shoot.',
      metadata: { category: 'decision_making', play_type: 'catch and shoot', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'gap-closeout-003',
      text: 'The chain reaction of the gap theory: drive and make two people guard one, kick the ball out, the recovering defender has a bad closeout, the next player wins the closeout by driving, forces two people to guard one again, kicks it out again. This chain continues until someone gets an open shot or layup. Each closeout is an opportunity to gain an advantage.',
      metadata: { category: 'decision_making', play_type: 'drive to basket', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'gap-closeout-004',
      text: 'A common pattern in the gap theory: the ball gets thrown to the wing or corner, the offensive player wins the closeout by driving, forces the help defender to step up, and if the player in the room or short corner is covered, the ball swings to the opposite wing or corner where the next defender must close out. Every swing of the ball creates another closeout opportunity. The offense just has to keep making the right read.',
      metadata: { category: 'decision_making', play_type: 'drive to basket' }
    },

    // ─── GAP THEORY: CREATING MISMATCHES ──────────────────────────────

    {
      id: 'gap-mismatch-001',
      text: 'Creating mismatches is the third concept of the gap theory. When ball screens are set and teams switch, you get either a speed mismatch — a quick guard against a bigger slower defender — or a size mismatch — a taller post player against a smaller guard. Recognizing and attacking these mismatches is critical to creating easy scoring opportunities.',
      metadata: { category: 'decision_making', play_type: 'pick and roll' }
    },
    {
      id: 'gap-mismatch-002',
      text: 'When you have a speed mismatch against a bigger defender, you do not need a complex move — a simple hesitation or one quick dribble move is enough to blow by them because they cannot move laterally fast enough. When you have a size mismatch with a post player against a smaller guard, get the ball to the post and let him go to work in the paint.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },

    // ─── GAP THEORY: DEFENSIVE READS ──────────────────────────────────

    {
      id: 'gap-defense-read-001',
      text: 'Understanding the defense\'s philosophy about gaps is critical. In denial defense, off-ball defenders stay very close to their matchup trying to deny passes — this creates very big gaps for the ball handler to drive through. In packline defense, defenders sit in the gaps to take away driving angles — but they are now farther from their matchup, which means longer closeouts and more open shots on kick-outs.',
      metadata: { category: 'decision_making', play_type: 'drive to basket' }
    },

  ];

  console.log(`🏀 Seeding ${knowledge.length} gap theory entries...`);

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
