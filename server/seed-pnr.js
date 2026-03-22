const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function main() {
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const index = pinecone.index('courtiq-brain');

  const knowledge = [

    // ─── PICK AND ROLL: SCREEN SETUP ────────────────────────────────

    {
      id: 'pnr-setup-001',
      text: 'The most important part of the pick and roll happens BEFORE the screen. The ball handler must create separation from their defender before arriving at the screen. If the defender is attached and on the ball handler\'s back, the big man can take liberties — he can drop with the roller or play both. But if the ball handler creates even arm\'s length of separation, the big is completely isolated on the ball handler one-on-one and must commit.',
      metadata: { category: 'positioning', play_type: 'pick and roll' }
    },
    {
      id: 'pnr-setup-002',
      text: 'Use a hesitation dribble or inside-out move to get your defender leaning or on their heels before coming off the pick and roll screen. Even a small hesitation that gets the defender to shift their weight is enough. The goal is to manipulate your defender into the screener\'s feet — once they are between the screener\'s feet, you know they are getting screened and you can attack.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'pnr-setup-003',
      text: 'If your defender is attached when the screener offers the screen, do NOT just come off the screen and dribble at the big man. Back up, use a hang dribble to threaten going middle, and wait for your defender to shift. Once they step over or get between the screener\'s feet, then come off the screen. Patience in the setup creates massive advantages.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'pnr-setup-004',
      text: 'A ball handler who comes off the pick and roll without first setting up their defender is being lazy and costing the team a higher percentage opportunity. Even on plays that score, the setup matters because percentages matter over time. A good setup turns a difficult play into a simple, easy read.',
      metadata: { category: 'habit', play_type: 'pick and roll' }
    },
    {
      id: 'pnr-setup-005',
      text: 'Setting your man up before coming off the pick and roll is taught in elementary school basketball, but most players and coaches never explain WHY it is such an advantage. The reason: picking off your defender successfully isolates you one-on-one against the big man, and then the ENTIRE defense has to react to either take away the roll man or stop you. That reaction is what creates open shots for everyone.',
      metadata: { category: 'general', play_type: 'pick and roll' }
    },

    // ─── PICK AND ROLL: READING THE BIG (2-ON-1) ───────────────────

    {
      id: 'pnr-read-big-001',
      text: 'When the ball handler has successfully used the screen and is in a 2-on-1 against the big defender, the big is in an impossible position. He has to worry about three things: (1) the ball handler pulling up for a jumper in the pocket, (2) the ball handler attacking all the way to the rim, and (3) the ball handler passing to the rolling screener. The ball handler should read which option the big takes away and attack the one he leaves open.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'pnr-read-big-002',
      text: 'Against a dropping big man in pick and roll, the ball handler has space to pull up for a jumper or use a floater. If the big drops deep to protect the rim, the pull-up or floater in the pocket between the big and the trailing defender is the correct play. Do not dribble into the big — use the space he gives you.',
      metadata: { category: 'shot_quality', play_type: 'pick and roll', verdict: 'GOOD SHOT' }
    },
    {
      id: 'pnr-read-big-003',
      text: 'Against a big who commits hard to the ball handler in pick and roll, the pocket pass to the rolling screener is the correct read. The key is manipulating the big — use a hard dribble or head fake toward the basket to force the big to commit, then drop the pocket pass to the roller behind him. If the big respects the roller, attack the basket yourself.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'pnr-read-big-004',
      text: 'In pick and roll, the ball handler should manipulate the big defender before making a decision. If the big defender plays the pocket pass, attack him on the baseline. If the big defender respects the baseline, the pocket pass to the roller is open. Force the big to pick his poison — never make your decision before reading his positioning.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },

    // ─── PICK AND ROLL: READING HELP DEFENDERS ─────────────────────

    {
      id: 'pnr-help-001',
      text: 'In pick and roll, once the ball handler beats the first layer (their defender and the big), there is often a third defender in a help position sitting in the driving gap. This defender is usually stunting — pretending to help and then recovering. The ball handler must read: if the help defender commits, kick out to the open shooter. If he only stunts, attack through him because once his hips turn one way, he cannot make a play on the ball behind him.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'pnr-help-002',
      text: 'When driving out of pick and roll, read the help defender\'s hips. Once a help defender turns their hips one direction, they physically cannot recover to play the ball on their backside — human beings do not have that shoulder mobility. Attack the space behind the turned hips. This is a fundamental rule of reading help defense.',
      metadata: { category: 'positioning', play_type: 'pick and roll' }
    },
    {
      id: 'pnr-help-003',
      text: 'In pick and roll, never tip your hand on a pass. When driving deep into the paint with the roller, do not look at your target until the last moment. Use your eyes and chest to look one direction to draw the help defender, then pass to the roller when the window opens. The defense reads your eyes — if you stare at the roller, the help will take away the pass.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'pnr-help-004',
      text: 'When driving out of pick and roll and the weak side defender comes over to help on the roller, the ball handler should spray the ball to the open shooters on the weak side. This is why five-out spacing is devastating in pick and roll — when the defense collapses, there are three-point shooters everywhere to kick to.',
      metadata: { category: 'decision_making', play_type: 'pick and roll' }
    },

    // ─── PICK AND ROLL: COUNTERS AND SOLUTIONS ─────────────────────

    {
      id: 'pnr-counter-floater',
      text: 'The running floater off one leg is a critical pick and roll counter. When the ball handler has not created enough separation to pull up on two feet, and the trailing defender is on their back, the floater on the move prevents the defender from recovering and blocking the shot. This is a horizontal pocket of space, not vertical — the ball handler stays moving forward in the air instead of stopping. Practice this as a solution for when the pull-up is not available.',
      metadata: { category: 'shot_quality', play_type: 'pick and roll', verdict: 'GOOD SHOT' }
    },
    {
      id: 'pnr-counter-reject',
      text: 'Rejecting the pick and roll (going away from the screen) is the correct play when the ball handler reads that the screen defender is too high or when their own defender is funneling them toward help. If the ball handler sees open space on the reject side and the defense has overcommitted to the screen side, attack the reject with a crossover and collapse the defense. In five-out spacing, this often leads to open three-point shooters when the defense collapses.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'pnr-counter-slip',
      text: 'The screener slip is a deadly counter in pick and roll. When the screen defender comes up too high to the level of the pick to hedge or trap, the screener should slip the screen — cutting hard to the basket before setting the screen. The ball handler reads this by seeing the second defender too high and feeds the roller slipping behind the defense. This works especially well with a roller who is a great finisher.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'pnr-counter-down',
      text: 'When the ball handler\'s defender uses a "down" coverage — pushing the ball handler toward the sideline expecting a big to be waiting — the ball handler should read if there is actually a big behind the defender. If the defender downs without a partner, the ball handler can accept the down coverage and then attack the space behind the defender because there is no one to funnel to.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },

    // ─── PICK AND ROLL: BALL HANDLING AND PASSING ───────────────────

    {
      id: 'pnr-passing-001',
      text: 'Being able to pass with both hands out of the pick and roll is essential. If the ball handler can only pass with their right hand, the defense knows what is coming. Passing out of the left hand to the corner shooter, over the top to the cutter, or in the pocket to the roller — all while driving left — makes the ball handler unpredictable. The left-hand pass should be practiced until it is natural, not an afterthought.',
      metadata: { category: 'habit', play_type: 'pick and roll' }
    },
    {
      id: 'pnr-passing-002',
      text: 'The pocket pass in pick and roll must be delivered at the last possible moment. The ball handler should draw the help defender to them with one more hard dribble, wait for the defender\'s hips to turn, and then drop the pass to the rolling big. Delivering the pocket pass too early allows the defense to recover. The timing of the pass is everything — feel for when the window opens.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },

    // ─── PICK AND ROLL: HANG DRIBBLE / HESITATION ───────────────────

    {
      id: 'pnr-hesitation-001',
      text: 'The hang dribble hesitation in pick and roll is about baiting the defender. The ball handler dribbles the ball behind them while approaching the screen, changing speeds to keep the defender off balance. If the defender gets too close, the ball handler goes by them. If the defender gives space, the ball handler can hesitate again or pull up for a shot. This technique is about rhythm and changing speeds, not about being fast or athletic.',
      metadata: { category: 'decision_making', play_type: 'pick and roll' }
    },
    {
      id: 'pnr-hesitation-002',
      text: 'The hang dribble works in pick and roll because the ball handler performs it at the three-point line where they are a shooting threat. The defender\'s weight shifts slightly toward the ball handler because they are approaching shooting range. One quick move from this position creates the angle to get by the defender. The key is recognizing when the defender\'s weight shifts and exploiting that moment.',
      metadata: { category: 'decision_making', play_type: 'pick and roll' }
    },

    // ─── PICK AND ROLL: DEFENSIVE ADJUSTMENTS AND RESPONSES ─────────

    {
      id: 'pnr-adjust-001',
      text: 'When the defense adjusts in pick and roll by sending less help and playing the ball handler to score (letting them go one-on-one), the ball handler should be aggressive and attack. Pull up in the pocket, use floaters, and take what the defense gives. If the defense is not helping on the roller, the ball handler has a clear path to score.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'pnr-adjust-002',
      text: 'When the defense adjusts to help more aggressively on the ball handler in pick and roll by bringing weak side defenders over to the roller, the ball handler should spray the ball to open shooters. This is why teams do not want to help too aggressively — it opens up three-point shots. The ball handler must read the coverage each game and each possession and attack what the defense gives.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'pnr-adjust-003',
      text: 'Pick and roll is a chess match that changes from game to game and possession to possession. The ball handler must constantly read whether the defense is dropping, hedging, switching, trapping, or playing ICE. Each coverage has a counter. The best pick and roll players have a solution for every coverage and never force the same play regardless of what the defense gives them.',
      metadata: { category: 'general', play_type: 'pick and roll' }
    },

    // ─── PICK AND ROLL: DRIVING AND FINISHING ───────────────────────

    {
      id: 'pnr-drive-001',
      text: 'When driving deep into the paint out of pick and roll, do not leave your feet without a plan. Jumping in the air without knowing where the pass is going is a last resort. The better play is to keep your dribble alive, stay on two feet, and read the defense. If the defender is on your back, they have to drop with the roller — you have created a numbers advantage. Use it by staying patient.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'pnr-drive-002',
      text: 'When driving out of pick and roll and the trailing defender is too close to pull up, use the running floater instead of trying to stop and shoot. The floater on the move exploits the horizontal space between the dropping big and the trailing defender. Stopping to pull up in this situation gets the shot blocked because the defender recovers. Stay moving and release the floater before the big can contest.',
      metadata: { category: 'shot_quality', play_type: 'pick and roll', verdict: 'GOOD SHOT' }
    },
    {
      id: 'pnr-drive-003',
      text: 'When driving out of pick and roll and the defender plays you too tight — right on your back — the correct play is to pull up and let them run into you for two free throws. Many players chicken out on this and try to float forward, which turns a free throw opportunity into a contested shot. If the defender is trailing too close, stop short and draw the foul.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },

    // ─── PICK AND ROLL: ROLLER RESPONSIBILITIES ─────────────────────

    {
      id: 'pnr-roller-001',
      text: 'The screener in pick and roll must roll HARD to the basket after setting the screen. A screener who stands still after the screen is wasting the play. The roller creates the second threat that makes the big defender\'s job impossible. The harder and faster the roll, the more the defense has to react and the more space opens up for both the ball handler and the roller.',
      metadata: { category: 'positioning', play_type: 'pick and roll' }
    },
    {
      id: 'pnr-roller-002',
      text: 'The roller in pick and roll must have great hands, soft touch, and the ability to finish at the rim through contact. The pocket pass from the ball handler comes in tight spaces at difficult angles. A roller who can catch and finish these passes in traffic is devastating — it forces the defense to commit to the roller, which opens up everything else.',
      metadata: { category: 'positioning', play_type: 'pick and roll' }
    },

  ];

  console.log(`🏀 Seeding ${knowledge.length} pick and roll entries...`);

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
