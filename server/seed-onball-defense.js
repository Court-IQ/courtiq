const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function main() {
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const index = pinecone.index('courtiq-brain');

  const knowledge = [

    // ─── ON-BALL DEFENSE: STANCE AND POSITIONING ──────────────────────

    {
      id: 'def-onball-stance-001',
      text: 'Elite on-ball defenders use a mixture of stances depending on the situation — sometimes an upward stance with minimal knee bend, sometimes a classic loaded stance — but the goal is always the same: cut off the drive with your chest. You are not just sliding to contain. You are jamming the ball handler, physically stopping their first few dribbles. Beat them to the spot, take away their space, and win the physical battle early.',
      metadata: { category: 'positioning', play_type: 'defensive play' }
    },
    {
      id: 'def-onball-stance-002',
      text: 'The best on-ball defenders never drop their hips into a swivel. They constantly reset into a square stance, ready to move in either direction. Most defenders swivel their hips back and forth, exposing one top foot for another — this might feel quick but it leaves you vulnerable to blow-bys. Instead, keep your feet square, active, and constantly adjusting. Come into pressure, then retreat into space, but always stay loaded.',
      metadata: { category: 'positioning', play_type: 'defensive play' }
    },
    {
      id: 'def-onball-stance-003',
      text: 'On defense, always stay on the balls of your feet. Even when stepping back, stay on your forefoot, never on your heels. If your weight shifts to your heels, you lose your explosiveness and you are dead in the water. When defenders reach back or try to stop with their heels, they cannot recover. The best defenders stay on the balls of their feet in every moment.',
      metadata: { category: 'positioning', play_type: 'defensive play' }
    },

    // ─── ON-BALL DEFENSE: SLIDING AND FOOTWORK ────────────────────────

    {
      id: 'def-onball-slide-001',
      text: 'When sliding on defense, do not passively reach with the lead foot. Push off the trail leg and explode laterally from the inside angle. Reaching or lunging with the lead foot puts you off balance and leaves you exposed. The explosive push from the trail leg is the key movement pattern of elite defenders — it generates force and keeps you in position.',
      metadata: { category: 'positioning', play_type: 'defensive play' }
    },
    {
      id: 'def-onball-slide-002',
      text: 'The two-touch slide is an advanced defensive footwork technique. When you get faked out and start moving in the wrong direction, anchor your lead foot and execute a quick foot replacement — the back foot replaces the front foot rapidly. This allows you to bring your back leg under your center of gravity and slide into even greater distances to recover. It is not just a crossover step — it is a foot replacement that generates more force than a traditional slide.',
      metadata: { category: 'positioning', play_type: 'defensive play' }
    },
    {
      id: 'def-onball-slide-003',
      text: 'When you get beat or opened up on defense, do not slide with the offense — slide into the offense. Instead of recovering at an angle parallel to the ball handler, hop forward into the dribbler to jam the ball. Protect your top foot by sliding into contact. This aggressive recovery footwork turns a blown defensive play into a reset.',
      metadata: { category: 'positioning', play_type: 'defensive play' }
    },

    // ─── ON-BALL DEFENSE: CHEST SLIDES AND CONTACT ────────────────────

    {
      id: 'def-onball-chest-001',
      text: 'A chest slide is cutting off the drive physically by getting your chest in front of the ball handler while showing your hands to the refs. You are not just containing — you are stopping the drive with your body. The key is to get chest to chest, sealing off the driving lane and killing the drive. Show your hands so you do not get called for a foul.',
      metadata: { category: 'positioning', play_type: 'defensive play' }
    },
    {
      id: 'def-onball-chest-002',
      text: 'A common mistake on chest slides is making contact on the inside shoulder of the ball handler. This lets the ball handler ride the contact and turn the corner. Instead, get chest to chest — directly in front of the ball handler — sealing off the driving lane completely. Contact on the inside shoulder actually helps the offense, not the defense.',
      metadata: { category: 'habit', play_type: 'defensive play' }
    },
    {
      id: 'def-onball-contact-001',
      text: 'Elite defenders use early contact strategically — sometimes the early jam is not about stopping the drive, it is about creating space. Use your body to bump the ball handler, then push off slightly to create separation and put yourself back in front. This uses the one touch referees usually allow to contain the first move while resetting your position for the next one. A great concept for pressure defenders.',
      metadata: { category: 'decision_making', play_type: 'defensive play' }
    },

    // ─── ON-BALL DEFENSE: EYES AND READS ──────────────────────────────

    {
      id: 'def-onball-eyes-001',
      text: 'Elite on-ball defenders do not watch the ball. The ball is a distraction — it can be moved in any direction to fake you out. Instead, watch the body. Before the pass arrives, lock your eyes on the offensive player\'s chest. As the move begins, shift your eyes to the hips. On a hang dribble, follow the upper arm or shoulder. The hips and the chest rarely lie. You are not trying to get steals — you are trying to win the first dribble.',
      metadata: { category: 'decision_making', play_type: 'defensive play' }
    },

    // ─── ON-BALL DEFENSE: PULLING THE CHAIR AND BAITING ───────────────

    {
      id: 'def-onball-chair-001',
      text: 'Pulling the chair on defense means taking away the contact that the ball handler expects. When ball handlers adjust to your physicality and start leaning into you, take the contact away completely. Let them lean in and then make them pay — they will be off balance with the ball exposed. You want the offensive player to expect contact and then not get it.',
      metadata: { category: 'decision_making', play_type: 'defensive play' }
    },
    {
      id: 'def-onball-bait-001',
      text: 'Elite defenders bait contact on defense — meeting the first or second attack with physical pressure, then vanishing just when the ball handler commits to leaning into it. This is where turnovers happen: not from reaching or gambling, but from pure defense. The ball handler travels, throws a crazy pass, or exposes the ball for a swipe steal because the contact they expected suddenly disappeared.',
      metadata: { category: 'decision_making', play_type: 'defensive play' }
    },
    {
      id: 'def-onball-uncertainty-001',
      text: 'The chess match of elite defense is creating a constant state of uncertainty for the offensive player. Sometimes you give contact, sometimes you take it away. Sometimes you jam the drive, sometimes you pull the chair. Sometimes you take a charge. When you pair physical defense with smart reads and unpredictable responses, no offensive player can get comfortable against you. Unpredictability is a weapon on defense.',
      metadata: { category: 'general', play_type: 'defensive play' }
    },

    // ─── ON-BALL DEFENSE: RECOVERY AND CONTESTS ───────────────────────

    {
      id: 'def-onball-recovery-001',
      text: 'When a ball handler goes to a step back against a square stance defender, the defender must have elite recovery footwork. The key is the back foot — it must be flat to the floor, fully loaded, and perpendicular to your momentum. This allows you to absorb the lateral force and transfer it into a forward contest. Like a fencing lunge or a wrestling stance, the ability to strike forward with force from a loaded position is what creates high-level shot contests on step backs.',
      metadata: { category: 'positioning', play_type: 'defensive play' }
    },

    // ─── ON-BALL DEFENSE: BALL SCREEN NAVIGATION ──────────────────────

    {
      id: 'def-onball-screen-001',
      text: 'Ball screen navigation is one of the most underrated traits in on-ball defense. If you cannot get through a screen, your pressure gets neutralized by virtually any offense. The technique for erasing screens involves engaging the ball handler early, shrinking the space between you and the screener, pivoting over the screen, and riding the driving angle wide with your upper arm. You must fight through the screen, not around it.',
      metadata: { category: 'positioning', play_type: 'defensive play' }
    },

    // ─── ON-BALL DEFENSE: CHASE DOWN BLOCKS ───────────────────────────

    {
      id: 'def-onball-chasedown-001',
      text: 'Smaller defenders can still get chase down blocks by aiming for the release point rather than the ball at its highest point. Attack the outside shoulder of the offensive player and time your leap to meet the ball as it comes up for the shot, not at the peak. This technique allows guards and wings to block shots from behind against bigger players.',
      metadata: { category: 'positioning', play_type: 'defensive play' }
    },

  ];

  console.log(`🏀 Seeding ${knowledge.length} on-ball defense entries...`);

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
