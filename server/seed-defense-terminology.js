const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function main() {
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const index = pinecone.index('courtiq-brain');

  const knowledge = [

    // ─── HELP DEFENSE CONCEPTS ────────────────────────────────────────

    {
      id: 'def-term-gap',
      text: 'Being in a gap is the most basic concept of help defense. If you draw a line between the ball handler and your man, you should be positioned somewhere on that line. Gap defense means you are in a help position between the ball and your assignment, ready to help on the drive while still being able to recover to your man.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },
    {
      id: 'def-term-closeout',
      text: 'A closeout happens when your man does not have the ball and then receives a pass. You must close the distance between you and the ball quickly and under control. You can close out with two hands up to contest the shot, or with one hand up. The key is arriving under control so the offensive player cannot blow by you.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },
    {
      id: 'def-term-let-through',
      text: 'A let through is a way to defend the dribble handoff without switching. The defender guarding the ball backs up and lets his teammate come through the gap between him and the screener so there is no separation. This keeps the original matchups intact and prevents the offense from creating a mismatch.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },
    {
      id: 'def-term-cupping',
      text: 'Cupping is when a defender in transition comes over to help stop the ball when the trailer — the offensive player who has not arrived yet — is not in the picture. The defender cups around and helps his teammate by cutting off the ball handler until the rest of the defense gets set.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },
    {
      id: 'def-term-stunting',
      text: 'Stunting is when a help defender comes over and swipes at the ball or fakes a commitment to make the offensive player hesitate. The defender then recovers back to his own man as his teammate gets back to their matchup. Stunting can be done on the catch or on dribble penetration. The goal is to slow the offense down without fully committing and leaving your man open.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },
    {
      id: 'def-term-raking',
      text: 'Raking is a more aggressive variation of stunting where the help defender fully commits to trying to steal the ball from the ball handler, typically with two hands. Unlike a stunt where you fake and recover, a rake is an all-out attempt to strip the ball.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },
    {
      id: 'def-term-denying',
      text: 'Denying is an aggressive defensive strategy where you try to take your matchup completely out of the possession by not letting them touch the ball. No matter where the offensive player goes, you are in full denial — body positioned in the passing lane, hand out, not allowing a pass to be completed.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },

    // ─── CONTESTING AND REBOUNDING ────────────────────────────────────

    {
      id: 'def-term-contest',
      text: 'Contesting the shot means leaving the ground and extending one or two hands to try and impact the shooter. The goal is to get a hand in the shooter\'s face and alter the shot without fouling. A good contest is the difference between an open look and a tough shot.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },
    {
      id: 'def-term-walling-up',
      text: 'Walling up is a way to contest shots around the basket without trying to block them. The defender leaves the ground and stays inside their cylinder — arms straight up — to make it difficult for the offensive player to score over the top. The goal is to impede their vision and make the finish tough without fouling. Walling up can be done jumping or staying on the ground.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },
    {
      id: 'def-term-charge',
      text: 'Taking a charge is one of the most impactful plays on the defensive end. The defender sacrifices their body by establishing legal position in the path of the offensive player and absorbing the contact. It results in an offensive foul, a turnover, and a change of possession.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },
    {
      id: 'def-term-boxing-out',
      text: 'Boxing out is arguably the most important thing that needs to happen at the end of a defensive possession. It means making contact with your matchup before pursuing the rebound. You find your man, put your body on them, and then go get the ball. Without boxing out, second chance points kill defenses.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },

    // ─── BALL SCREEN COVERAGES ────────────────────────────────────────

    {
      id: 'def-term-lock-under',
      text: 'Lock and under, also called stick and under, is a rare ball screen coverage where the defender guarding the screener locks onto his man, allowing the ball handler\'s defender to get underneath the screen and stay with the ball handler. The on-ball defender goes under the screen instead of over it.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },
    {
      id: 'def-term-switch',
      text: 'Switching the ball screen is when the two defenders involved in the ball screen simply swap matchups. The defender guarding the screener takes the ball handler, and the defender guarding the ball handler takes the screener. This is a simple coverage but can create mismatches.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },
    {
      id: 'def-term-contain',
      text: 'Contain coverage in ball screen defense — also called drop, low show, or soft hedge — is when the big defender contains the ball handler just enough for the on-ball defender to recover and get back in front. Then everybody gets back to their original matchup. This is the coverage with the most options and variations.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },
    {
      id: 'def-term-hard-hedge',
      text: 'Hard hedging is a more aggressive ball screen coverage where the big defender slides up and actively hedges the ball screen to slow down the ball handler. The on-ball defender uses this time to fight over the screen and get back to his matchup. It is more aggressive than contain but less aggressive than a blitz.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },
    {
      id: 'def-term-blitz',
      text: 'Blitzing is the most aggressive ball screen coverage. The big defender hedges and then stays to trap the ball handler along with the on-ball defender. The two defenders smother the ball, trying to force a steal or a bad pass. Because two defenders are on the ball, the rest of the defense must rotate to cover the open players.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },
    {
      id: 'def-term-ice',
      text: 'Icing, also called downing, is a nuanced ball screen coverage where the on-ball defender forces the ball handler away from the screen toward the sideline. The ball handler is not allowed to use the screen. The screener\'s defender comes over to help either aggressively or conservatively as the ball is pushed away from the screen.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },
    {
      id: 'def-term-tagging',
      text: 'Tagging happens in ball screen coverage when the screener\'s defender has to help on the ball handler, which leaves the roll man open for a split second. The corner defender must come over and tag the roll man — stay attached to him — while the big recovers back to his matchup. The tag defender is responsible for taking away the easy pass to the roller.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },

    // ─── OFF-BALL SCREEN DEFENSE ──────────────────────────────────────

    {
      id: 'def-term-chasing',
      text: 'Chasing is one of two ways to guard a down screen without switching. The defender follows his man around the screen to get back in front on the other side. You stay attached to the cutter and fight through or around the screen to maintain your matchup.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },
    {
      id: 'def-term-shoot-gap',
      text: 'Shooting the gap is the other way to guard a down screen without switching. Instead of following your matchup around the screen, you shoot through the gap between the screener and your man and meet the cutter on the other side. This is a shortcut that can get you there faster but requires good anticipation.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },
    {
      id: 'def-term-x-out',
      text: 'X-ing out is an advanced defensive concept used on screen the screener actions. When an offensive player sets a screen and then receives a down screen, the backside defender chases the original screener off the down screen while the original screener\'s defender switches or X\'s out to pick up the other man. Two defenders swap responsibilities to stay matched up.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },

    // ─── ROTATIONS AND POST DEFENSE ───────────────────────────────────

    {
      id: 'def-term-baseline-rotation',
      text: 'Baseline rotation is a standard defensive rotation when an offensive player drives baseline. The opposite defender rotates over to help stop the drive, the elbow defender sinks down to take the helper\'s man, and one defender is left responsible for two offensive players. The rotation will not be perfect every time, but getting in the right positions is critical.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },
    {
      id: 'def-term-help-helper',
      text: 'Helping the helper is a critical defensive concept. When a defender rotates over to help on dribble penetration, he leaves his man. Another defender must rotate over to help that helper by covering the man he left. Good defenses rotate in a chain — each defender helps the one who just helped, keeping everything covered.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },
    {
      id: 'def-term-digging',
      text: 'Digging is the post defense version of stunting on the perimeter. A help defender comes in and tries to influence the post player to pick up the ball before he can get to his sweet spot and score. The goal is to disrupt the post player\'s rhythm without fully committing and leaving your own man wide open.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },
    {
      id: 'def-term-firing',
      text: 'Firing is the more aggressive version of digging. Instead of just stunting at the post player, you go all out and double team the ball — similar to a blitz on ball screen coverage. Because you now have two defenders on the ball, the defense is one man down and must do a full rotation where everybody takes the next man over to get matched back up.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },
    {
      id: 'def-term-full-rotation',
      text: 'A full rotation happens when the defense sends a double team — whether firing at a post player or blitzing a ball screen — and is left one defender down. Every defender must rotate and take the next man over to get matched back up. Full rotations require all five defenders communicating and moving together to cover the open players.',
      metadata: { category: 'terminology', play_type: 'defensive play' }
    },

  ];

  console.log(`🏀 Seeding ${knowledge.length} defensive terminology entries...`);

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
