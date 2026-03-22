const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function main() {
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const index = pinecone.index('courtiq-brain');

  const knowledge = [

    // ─── BALL SCREEN TYPES ────────────────────────────────────────────

    {
      id: 'term-ballscreen-get',
      text: 'A get screen is the most common type of ball screen in basketball. It is a standard screen that sends the ball handler to the middle of the court. This is what most people think of when they hear pick and roll.',
      metadata: { category: 'terminology', play_type: 'pick and roll' }
    },
    {
      id: 'term-ballscreen-stepup',
      text: 'A step up screen, also called an alley screen, is a ball screen that sends the ball handler toward the sideline instead of the middle. The screener sets the angle so the ball handler is funneled to the side of the court.',
      metadata: { category: 'terminology', play_type: 'pick and roll' }
    },
    {
      id: 'term-ballscreen-flat',
      text: 'A flat ball screen is set in the middle third of the court and gives the ball handler the option to go either direction — left or right. Because it is set flat, the defense cannot predict which way the ball handler will attack.',
      metadata: { category: 'terminology', play_type: 'pick and roll' }
    },

    // ─── SCREENER ACTIONS ─────────────────────────────────────────────

    {
      id: 'term-roll',
      text: 'Rolling is when the screener sets the ball screen and then rolls toward the basket. This is where the term pick and roll comes from. The roller dives to the rim looking for a pass from the ball handler after the screen is set.',
      metadata: { category: 'terminology', play_type: 'pick and roll' }
    },
    {
      id: 'term-pop',
      text: 'Popping is when the screener sets the ball screen and then pops back behind the three-point line instead of rolling to the basket. This is where the term pick and pop comes from. The screener makes himself available for a catch and shoot three-pointer.',
      metadata: { category: 'terminology', play_type: 'pick and roll' }
    },
    {
      id: 'term-shocker',
      text: 'A shocker action is when the screener pretends to set a ball screen but never actually makes contact. Instead, the big slips directly to the basket before setting the screen. The result is the same as a pick and roll — the big gets to the rim — but the defense is caught off guard because the screen never happens.',
      metadata: { category: 'terminology', play_type: 'pick and roll' }
    },
    {
      id: 'term-ghost',
      text: 'A ghost screen is the pick and pop version of a shocker action. The big makes it look like he is going to set a ball screen but never actually makes contact. Instead of rolling to the basket, the big slips out to the three-point line for a catch and shoot. This is one of the most prevalent actions in modern basketball because bigs can shoot threes much better than they used to.',
      metadata: { category: 'terminology', play_type: 'pick and roll' }
    },
    {
      id: 'term-flip',
      text: 'Flipping is when a screener starts to set one type of ball screen and then changes the angle to set a different one. For example, a big goes in to set a get screen sending the ball handler to the middle, then flips to the baseline and sets a step up screen instead. This can be done from any angle on the court to confuse the defense.',
      metadata: { category: 'terminology', play_type: 'pick and roll' }
    },
    {
      id: 'term-twist',
      text: 'A twist action is when a screener sets a step up screen, no contact takes place, so the big flips around and sets a get screen instead. It is the opposite direction of a flip — the screener changes from a sideline angle to a middle angle.',
      metadata: { category: 'terminology', play_type: 'pick and roll' }
    },

    // ─── BALL HANDLER ACTIONS ─────────────────────────────────────────

    {
      id: 'term-reject',
      text: 'Rejecting a ball screen means the ball handler refuses the screen and goes the opposite direction. If the screen is set to send the ball handler left, the ball handler rejects it and goes right. This is also called refusing the screen. It is effective when the defense overcommits to the screen side.',
      metadata: { category: 'terminology', play_type: 'pick and roll' }
    },
    {
      id: 'term-snaking',
      text: 'Snaking is when the ball handler comes off a ball screen to one side and then weaves back in the opposite direction. The path the ball handler takes looks like a snake. For example, coming off a get screen to the middle and then snaking back to the right. This creates separation between the ball handler and their defender.',
      metadata: { category: 'terminology', play_type: 'pick and roll' }
    },
    {
      id: 'term-probing',
      text: 'Probing is when the ball handler comes off the screen and waits for the big help defender to get out of the way before attacking. The ball handler traps their defender on their back using the screen and holds them off while waiting for the big to leave. Once the big clears, the ball handler takes off and attacks the basket.',
      metadata: { category: 'terminology', play_type: 'pick and roll' }
    },
    {
      id: 'term-loading-gun',
      text: 'Loading the gun is the shot made famous by Steph Curry. As the guard comes off the ball screen, his defender gets stuck on the screen. If the big help defender is low and helps on the roll instead of stepping up, it gives the ball handler room to shoot a three-pointer right off the screen. The ball handler catches and shoots immediately coming off the pick.',
      metadata: { category: 'terminology', play_type: 'pick and roll' }
    },

    // ─── PNR PASSING TERMINOLOGY ──────────────────────────────────────

    {
      id: 'term-pocket-pass',
      text: 'A pocket pass is when the ball handler comes off the ball screen and throws the ball from his waist or hip area — from his pocket — to the rolling big. It is a quick, tight pass delivered low to get around or under the help defender.',
      metadata: { category: 'terminology', play_type: 'pick and roll' }
    },
    {
      id: 'term-short-roll',
      text: 'The short roll is when the screener does not roll all the way to the rim after setting the ball screen. Instead, the big rolls out short — typically to the free throw line area — and receives the ball early. The short roll area is the space between the free throw line and the paint.',
      metadata: { category: 'terminology', play_type: 'pick and roll' }
    },
    {
      id: 'term-shake-lift',
      text: 'A shake pass, also called a lift or a Phillip, is a pass to the perimeter player whose defender has left to help on the roller. As the big rolls to the basket, the help defender goes in to take away the short roll or the roll, which leaves the perimeter player open. That perimeter player shakes or lifts up to the top of the key to receive the pass for an open shot.',
      metadata: { category: 'terminology', play_type: 'pick and roll' }
    },
    {
      id: 'term-yoyo',
      text: 'A yo-yo action, also called roll and replace, happens when the big who set the screen rolls to the basket and then a second big who was low fills up to replace him. One big is rolling down, the other is replacing up — like a yo-yo. This typically makes one of the two bigs open because the defense cannot cover both movements.',
      metadata: { category: 'terminology', play_type: 'pick and roll' }
    },

    // ─── OFF-BALL SCREENS ─────────────────────────────────────────────

    {
      id: 'term-down-screen',
      text: 'A down screen, also called a pin down, is when an offensive player sets a screen for a teammate and sends them toward the perimeter. The screener comes down from a higher position to screen for a player who is lower, freeing them to come up to the three-point line or wing for a catch and shoot.',
      metadata: { category: 'terminology', play_type: 'off ball screen' }
    },
    {
      id: 'term-curl',
      text: 'A curl is when a player comes off a down screen and curls tight toward the basket instead of popping out to the perimeter. The player wraps around the screener and cuts to the rim looking for a layup or a pass near the basket.',
      metadata: { category: 'terminology', play_type: 'off ball screen' }
    },
    {
      id: 'term-fade',
      text: 'A fade is when a player receiving a down screen fades away from the passer instead of curling toward the basket. The player moves away from the ball to create space for a catch and shoot opportunity. Some people call this a flare, but a flare is more accurately a specific type of screen, not the cutting action.',
      metadata: { category: 'terminology', play_type: 'off ball screen' }
    },
    {
      id: 'term-flare-screen',
      text: 'A flare screen is when a big sets a screen for a perimeter player to send them away from the basketball. The screener positions himself so the cutter can flare out to the wing or corner for a catch and shoot three. A flare is a concept — it is a specific type of screen — not just a cutting action.',
      metadata: { category: 'terminology', play_type: 'off ball screen' }
    },
    {
      id: 'term-rip-screen',
      text: 'A rip screen is almost always set by a guard for a big man. It is an angled back screen designed to get the post player open near the block or close to the basket. The guard screens the big man\'s defender at an angle to free the big for a catch near the rim.',
      metadata: { category: 'terminology', play_type: 'off ball screen' }
    },
    {
      id: 'term-shuffle-screen',
      text: 'A shuffle screen looks almost identical to a rip screen, but the biggest difference is it is set higher on the court and is usually set by a big for a perimeter player. The big screens to free a guard or wing to cut toward the basket.',
      metadata: { category: 'terminology', play_type: 'off ball screen' }
    },
    {
      id: 'term-screen-screener',
      text: 'Screen the screener is an action where a player sets a cross screen for a big and then immediately receives a down screen from another player. The player who screened first becomes the one being screened. It is also called a cross screen down screen action. Two screens happen in sequence to create an open look.',
      metadata: { category: 'terminology', play_type: 'off ball screen' }
    },

    // ─── SPACING AND MOVEMENT ─────────────────────────────────────────

    {
      id: 'term-dunker-spot',
      text: 'The dunker spot, also called the room or the short corner, refers to the two spots behind the backboard just outside of the paint where post players hang out. When there is dribble penetration and the big\'s defender helps on the drive, the big standing in the dunker spot is usually left wide open for an easy finish.',
      metadata: { category: 'terminology', play_type: 'general' }
    },
    {
      id: 'term-post-up',
      text: 'A post-up is when an offensive player positions himself with his back to the basket, facing the basketball, typically with a smaller defender behind him. The player seals his defender and receives the ball in the low post or mid-post area to go to work.',
      metadata: { category: 'terminology', play_type: 'post move' }
    },
    {
      id: 'term-back-door',
      text: 'A back door cut, also called burning, is when a defender tries to jump or deny a passing lane and the offensive player cuts behind him to the basket. The key to a successful back door is the timing of the cut and throwing a good pass. The defender gets burned because he overcommitted to denying the pass.',
      metadata: { category: 'terminology', play_type: 'general' }
    },
    {
      id: 'term-45-cut',
      text: 'A 45 cut looks similar to a back door but the difference is you cut when your defender is not paying attention to you, not when they are overplaying. This typically happens during dribble penetration or on a pick and pop — the defender on the elbow turns to watch the ball and the cutter slashes to the basket unnoticed.',
      metadata: { category: 'terminology', play_type: 'general' }
    },

    // ─── PASSING TERMINOLOGY ──────────────────────────────────────────

    {
      id: 'term-extra-pass',
      text: 'An extra pass, also called a one more or a one time, is when the ball gets kicked to the perimeter and a defender rotates to help, leaving somebody else more open. Instead of shooting a good shot, the player makes the extra pass to a teammate who has a great shot. Giving up a good shot for a great shot is the principle behind the extra pass.',
      metadata: { category: 'terminology', play_type: 'general' }
    },
    {
      id: 'term-dho',
      text: 'DHO stands for dribble handoff. It is anytime a player is dribbling the ball and hands it off to a teammate. It does not have to be from one particular position to another — any dribble handoff on the court is called a DHO.',
      metadata: { category: 'terminology', play_type: 'general' }
    },
    {
      id: 'term-hammer-pass',
      text: 'A hammer pass is the pass from a player who has beaten their defender on a baseline drive to a teammate in the opposite corner. When someone drives baseline, there are typically three people they can throw it to, and the pass skipped to the far corner is called the hammer pass. It usually results in a wide open three-pointer.',
      metadata: { category: 'terminology', play_type: 'drive to basket' }
    },
    {
      id: 'term-high-low',
      text: 'A high low, also called a passing triangle, is when the ball gets thrown to a player at the top of the key (the high position) and then is passed down to a player posting up near the basket (the low position). The ball goes from high to low. This is an effective way to get the ball inside to a post player.',
      metadata: { category: 'terminology', play_type: 'post move' }
    },

  ];

  console.log(`🏀 Seeding ${knowledge.length} terminology entries...`);

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
