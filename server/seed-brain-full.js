const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function main() {
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const index = pinecone.index('courtiq-brain');

  const knowledge = [

    // ─── SHOT QUALITY ───────────────────────────────────────────────

    {
      id: 'sq-pullup-001',
      text: 'A pull up jumper with a defender within 2 feet is a BAD SHOT. The player should attack the closeout, get to the free throw line, or kick to an open teammate. High school players fall in love with the pull up mid range when the defense is right there — this is one of the lowest efficiency shots in basketball.',
      metadata: { category: 'shot_quality', play_type: 'pull up jumper', verdict: 'BAD SHOT' }
    },
    {
      id: 'sq-pullup-002',
      text: 'A pull up jumper off one hard dribble with the defender trailing behind by 3+ feet is a GOOD SHOT. The player has created separation with their first step. This is high quality shot creation — the player read the defender and attacked the right moment.',
      metadata: { category: 'shot_quality', play_type: 'pull up jumper', verdict: 'GOOD SHOT' }
    },
    {
      id: 'sq-3pt-001',
      text: 'A three pointer with a hard closing defender in your face is a BAD SHOT at the high school level unless you are an elite shooter above 38% from three. The correct play is to pump fake to draw the foul, attack the closeout, or swing the ball. Taking contested threes is one of the worst habits a player can develop.',
      metadata: { category: 'shot_quality', play_type: '3 pointer', verdict: 'BAD SHOT' }
    },
    {
      id: 'sq-3pt-002',
      text: 'A catch and shoot three pointer with 4+ feet of space and feet set is a GOOD SHOT every single time. This is exactly what spacing and ball movement is designed to create. A player who hesitates on an open three is hurting their team — they should be confident pulling the trigger.',
      metadata: { category: 'shot_quality', play_type: '3 pointer', verdict: 'GOOD SHOT' }
    },
    {
      id: 'sq-3pt-003',
      text: 'A three pointer off the dribble with a defender recovering is a GOOD SHOT if the player is balanced and has their feet set at the moment of release. The key is whether the player is square to the basket and not fading or jumping sideways.',
      metadata: { category: 'shot_quality', play_type: '3 pointer', verdict: 'GOOD SHOT' }
    },
    {
      id: 'sq-midrange-001',
      text: 'A mid range jumper from the elbow with a trailing defender is a GOOD SHOT. The elbow is one of the highest efficiency mid range spots — it opens up both sides of the paint and is a fundamental weapon. If the player is balanced and the defender is trailing, this is a green light shot.',
      metadata: { category: 'shot_quality', play_type: 'mid-range jumper', verdict: 'GOOD SHOT' }
    },
    {
      id: 'sq-midrange-002',
      text: 'A contested mid range jumper off the side of the backboard with a defender in your chest is a BAD SHOT. This is a low percentage shot from a bad location. The player should have driven to the basket, kicked out, or reset the offense.',
      metadata: { category: 'shot_quality', play_type: 'mid-range jumper', verdict: 'BAD SHOT' }
    },
    {
      id: 'sq-drive-001',
      text: 'A drive to basket that ends in a layup with only one defender in the paint is a GOOD SHOT. The player attacked the paint, drew the defense, and finished at the rim. This is high value basketball — getting to the rim consistently is one of the best things an offensive player can do.',
      metadata: { category: 'shot_quality', play_type: 'drive to basket', verdict: 'GOOD SHOT' }
    },
    {
      id: 'sq-drive-002',
      text: 'A drive to basket that goes into two or three help defenders with no attempt to kick out or find the open man is a BAD SHOT. The player should read the collapsing defense and find the open shooter or cutter instead of forcing into traffic.',
      metadata: { category: 'shot_quality', play_type: 'drive to basket', verdict: 'BAD SHOT' }
    },
    {
      id: 'sq-post-001',
      text: 'A post move that ends in a strong drop step with the defender on the wrong side is a GOOD SHOT. The player sealed their defender, created position, and executed a fundamental post move. Body contact into the defender is correct — the player should go up strong through contact.',
      metadata: { category: 'shot_quality', play_type: 'post move', verdict: 'GOOD SHOT' }
    },
    {
      id: 'sq-post-002',
      text: 'A post move that ends in a fade away off balance with a defender in front is a BAD SHOT. Fade aways dramatically lower shot percentage and should only be used as a last resort. The player should use a shot fake, attack the other side, or find the open cutter.',
      metadata: { category: 'shot_quality', play_type: 'post move', verdict: 'BAD SHOT' }
    },
    {
      id: 'sq-floater-001',
      text: 'A floater released before the shot blocker can contest, with proper arc and control, is a GOOD SHOT. The floater is the correct counter to the big defender in the paint. The key is releasing early, getting enough arc, and staying in control of your body going into the shot.',
      metadata: { category: 'shot_quality', play_type: 'floater', verdict: 'GOOD SHOT' }
    },
    {
      id: 'sq-floater-002',
      text: 'A floater that is rushed, flat, or released while off balance is a BAD SHOT. The most common floater mistake is going too fast and losing body control. The player should slow down one step before releasing to get proper lift and arc.',
      metadata: { category: 'shot_quality', play_type: 'floater', verdict: 'BAD SHOT' }
    },
    {
      id: 'sq-catchshoot-001',
      text: 'A catch and shoot with feet already set before the catch is a GOOD SHOT. The best shooters are always ready — they know where they are on the floor, have their hands ready, and their feet set before the ball arrives. This is what separates elite shooters from average ones.',
      metadata: { category: 'shot_quality', play_type: 'catch and shoot', verdict: 'GOOD SHOT' }
    },
    {
      id: 'sq-catchshoot-002',
      text: 'A catch and shoot where the player catches flat footed and needs to gather and reset their feet is a BAD SHOT. Off balance catch and shoots have significantly lower make percentages. The player needs to work on being ready before the catch.',
      metadata: { category: 'shot_quality', play_type: 'catch and shoot', verdict: 'BAD SHOT' }
    },
    {
      id: 'sq-fastbreak-001',
      text: 'In transition, a player who attacks before the defense is fully set and finishes at the rim is making the RIGHT DECISION. Getting easy transition baskets is one of the highest value plays in basketball. Slowing down in transition to set up a half court play lets the defense recover — always push.',
      metadata: { category: 'shot_quality', play_type: 'fast break', verdict: 'GOOD SHOT' }
    },
    {
      id: 'sq-pickroll-001',
      text: 'In a pick and roll, a pull up jumper at the top of the key when the defender goes under the screen is a GOOD SHOT. If the defender gives up the pull up, the ball handler should take it. Hesitating gives the defense time to recover and eliminates the advantage the screen created.',
      metadata: { category: 'shot_quality', play_type: 'pick and roll', verdict: 'GOOD SHOT' }
    },

    // ─── DECISION MAKING ────────────────────────────────────────────

    {
      id: 'dm-001',
      text: 'When a player drives and collapses the defense but does not kick out to the open corner shooter, that is a WRONG DECISION. Reading help defense and finding the open man is a fundamental skill. The corner three off a drive kick is one of the highest percentage shots in basketball.',
      metadata: { category: 'decision_making', verdict: 'WRONG DECISION' }
    },
    {
      id: 'dm-002',
      text: 'When a player pump fakes a closeout defender into the air and then attacks the basket or draws the foul, that is the RIGHT DECISION. The pump fake is a fundamental tool — if a defender leaves their feet on a closeout, the offense has a free path to the basket or the free throw line.',
      metadata: { category: 'decision_making', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'dm-003',
      text: 'When a player dribbles into a double team in the post and picks up their dribble with nowhere to go, that is a WRONG DECISION. The player must read the double team coming before it arrives and make the pass early. Picking up the dribble in a trap is a turnover waiting to happen.',
      metadata: { category: 'decision_making', verdict: 'WRONG DECISION' }
    },
    {
      id: 'dm-004',
      text: 'When a point guard pushes in transition and attacks before the defense is set, that is the RIGHT DECISION. Getting easy transition baskets is one of the highest value plays in basketball. Hesitating lets the defense recover. Always push pace unless the numbers are not there.',
      metadata: { category: 'decision_making', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'dm-005',
      text: 'When a player on the wing receives the ball and immediately dribbles without reading the defense, that is a WRONG DECISION. Catching and reading before dribbling is a fundamental skill. The dribble should be used with purpose — to attack a gap, not just to move.',
      metadata: { category: 'decision_making', verdict: 'WRONG DECISION' }
    },
    {
      id: 'dm-006',
      text: 'When a player uses a shot fake to get the defender off balance and then attacks the basket to draw a foul or get a higher percentage shot, that is the RIGHT DECISION. The shot fake is underused at the high school level. A good shot fake should be a full motion that sells the shot.',
      metadata: { category: 'decision_making', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'dm-007',
      text: 'When a player in the post receives the ball and immediately faces up and shoots without reading the defense, that is a WRONG DECISION. Post players should read the defender first — if the defender is behind them, go to work. If fronted, look for the lob or face up.',
      metadata: { category: 'decision_making', verdict: 'WRONG DECISION' }
    },
    {
      id: 'dm-008',
      text: 'When a guard uses the pick and roll and reads the defense correctly — attacking the hedge, splitting the trap, or kicking to the roll man — that is the RIGHT DECISION. Pick and roll reads are learned through repetition. The ball handler must decide before they use the screen, not after.',
      metadata: { category: 'decision_making', play_type: 'pick and roll', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'dm-009',
      text: 'When a player drives baseline and kicks out to the corner shooter who hits a three, that is the RIGHT DECISION. Baseline drives force the defense to rotate, which always opens the weak side corner. The baseline drive to corner kick is one of the most reliable actions in basketball.',
      metadata: { category: 'decision_making', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'dm-010',
      text: 'When a player forces a shot in the fourth quarter with the shot clock off and better options available, that is a WRONG DECISION. Late game shot selection must be even more disciplined. Forced shots in crucial moments are a sign of poor situational awareness.',
      metadata: { category: 'decision_making', verdict: 'WRONG DECISION' }
    },

    // ─── POSITIONING ────────────────────────────────────────────────

    {
      id: 'pos-001',
      text: 'Weak side players standing in the corner create spacing and keep the defense honest. This is correct offensive positioning. If weak side players collapse into the paint, they clog driving lanes and make it harder for the ball handler to attack. Spacing is the foundation of modern offense.',
      metadata: { category: 'positioning' }
    },
    {
      id: 'pos-002',
      text: 'A defender who is ball watching and loses their man on the weak side is out of position defensively. Off ball defense requires constant awareness of both the ball and your assigned player. This leads to easy backdoor cuts and open threes — the most preventable points in basketball.',
      metadata: { category: 'positioning' }
    },
    {
      id: 'pos-003',
      text: 'In a pick and roll, the screener should set the screen with their back to the basket and immediately roll hard to the rim after contact. Standing still after setting the screen is a wasted opportunity. The roll man is often the most open player on the floor.',
      metadata: { category: 'positioning', play_type: 'pick and roll' }
    },
    {
      id: 'pos-004',
      text: 'On a drive to basket, the weak side wing should relocate to the corner to create a kick out option. The strong side wing should space to the three point line. Players who do not move when the ball handler drives are not reading the play — they are standing and watching.',
      metadata: { category: 'positioning', play_type: 'drive to basket' }
    },
    {
      id: 'pos-005',
      text: 'In the post, a player should seal their defender with their body — hip to hip — before the ball is entered. A good post seal eliminates the defender. If the player does not seal before catching, the defender can front them or play the passing lane.',
      metadata: { category: 'positioning', play_type: 'post move' }
    },
    {
      id: 'pos-006',
      text: 'In transition offense, the ball handler should run the middle of the floor, and wings should sprint wide to the corners. This creates the widest possible spacing and forces the defense to cover the most ground. A wing who runs the same lane as the ball handler destroys the transition advantage.',
      metadata: { category: 'positioning', play_type: 'fast break' }
    },
    {
      id: 'pos-007',
      text: 'On defense, when the ball goes into the post, all off-ball defenders must drop one step toward the paint to help. This is called post help positioning. A defender who stays glued to their man on the three point line when the ball is in the post is out of position.',
      metadata: { category: 'positioning' }
    },
    {
      id: 'pos-008',
      text: 'A shooter coming off a screen should use the screen shoulder to shoulder — brushing past the screener as close as possible. Running wide around the screen gives the defender room to fight through. The tighter the curl, the harder it is for the defender to follow.',
      metadata: { category: 'positioning', play_type: 'catch and shoot' }
    },

    // ─── HABITS ─────────────────────────────────────────────────────

    {
      id: 'habit-pullup',
      text: 'A player who consistently takes pull up jumpers in the mid range when they have the ability to get to the rim has developed a comfort zone habit. This is common in high school players who are afraid of contact or have not practiced finishing. The fix: attack the rim in practice, demand contact, and develop both hands around the basket.',
      metadata: { category: 'habit' }
    },
    {
      id: 'habit-dribble',
      text: 'A player who dribbles the ball immediately upon catching it without reading the defense is an uncontrolled dribbler. This is one of the most common bad habits at the high school level. The fix: catch and read for one count before making any decision. The best players are a threat before they dribble.',
      metadata: { category: 'habit' }
    },
    {
      id: 'habit-closeout',
      text: 'A player who consistently attacks closeouts off the catch is developing an elite habit. This puts defenders in foul trouble and creates easy baskets. Attacking a hard closeout is one of the highest value plays in basketball and should be practiced and reinforced constantly.',
      metadata: { category: 'habit' }
    },
    {
      id: 'habit-offhand',
      text: 'A player who always goes to their strong hand on drives and layups is predictable and easy to defend. Developing the off hand is critical. Defenders will overplay the strong hand once they identify the tendency. The fix: do all ball handling drills weak hand only for one month.',
      metadata: { category: 'habit' }
    },
    {
      id: 'habit-contact',
      text: 'A player who avoids contact on drives and lays the ball up soft from too far out is leaving free throws on the table. Going up strong through contact draws fouls and puts the defense in foul trouble. The fix: practice jump stops into contact and finishing through defenders in practice.',
      metadata: { category: 'habit' }
    },
    {
      id: 'habit-transition',
      text: 'A player who consistently slows down in transition to wait for teammates instead of pushing pace is costing their team easy buckets. The first two seconds of transition are the most valuable in basketball. Sprint, push, and attack before the defense sets — teammates will catch up.',
      metadata: { category: 'habit' }
    },
    {
      id: 'habit-shot-selection',
      text: 'A player who takes the same type of shot regardless of the defensive coverage has not developed shot selection. Good shot selection means reading what the defense gives and taking what is open. If the defense takes away the three, drive. If they take away the drive, shoot. Always attack the weakness.',
      metadata: { category: 'habit' }
    },
    {
      id: 'habit-screening',
      text: 'A player who sets lazy, upright screens that do not stop defenders is wasting possessions. A good screen is set with feet wide, knees bent, and arms crossed across the chest. The screener should brace for contact and hold the screen until the ball handler clears.',
      metadata: { category: 'habit' }
    },

    // ─── DRILLS ─────────────────────────────────────────────────────

    {
      id: 'drill-mikan',
      text: 'The Mikan Drill improves finishing at the rim with both hands. The player stands under the basket and alternates layups from each side without letting the ball touch the floor. 3 sets of 20 makes builds touch, body control, and ambidexterity around the basket. Essential for any post player or guard who attacks the paint.',
      metadata: { category: 'drill', skill: 'finishing' }
    },
    {
      id: 'drill-form-shooting',
      text: 'Form Shooting Drill improves shot mechanics and muscle memory. Stand 3 feet from the basket, one hand behind the back, and shoot with one hand only focusing on arc, backspin, and follow through. 50 makes per session. Move back one step every 10 makes. This builds proper mechanics before bad habits form.',
      metadata: { category: 'drill', skill: 'shooting' }
    },
    {
      id: 'drill-chair-shooting',
      text: 'Chair Shooting Drill improves catch and shoot footwork. Place a chair at a spot on the floor. The player starts behind the chair, steps around it as if coming off a screen, catches a pass from a partner, and shoots immediately. The focus is on having feet set before the catch. 10 makes from 5 spots.',
      metadata: { category: 'drill', skill: 'catch and shoot' }
    },
    {
      id: 'drill-1v1-closeout',
      text: 'Closeout 1-on-1 Drill trains attackers to attack closeouts and defenders to close out under control. Defender starts at the elbow, passes to the wing, then closes out. Offensive player attacks the closeout — pump fake, one dribble pull up, or drive. Teaches both pump fake usage and proper closeout footwork.',
      metadata: { category: 'drill', skill: 'closeout attack' }
    },
    {
      id: 'drill-floater',
      text: 'The Floater Finishing Drill builds the floater in game situations. Ball handler starts at half court, drives at full speed to the paint, and releases a floater before the lane line. Partner plays passive defense at the rim. Focus on slowing down one step before release to get proper arc. 10 makes from each side.',
      metadata: { category: 'drill', skill: 'floater' }
    },
    {
      id: 'drill-post',
      text: 'The Post Footwork Drill builds drop steps, up and unders, and jump hooks. Start in the post with the ball, execute a drop step to the right, then alternate to the left. Then add the up and under — drop step, shot fake, step through. 5 reps each move from both sides. Builds muscle memory for the most important post moves.',
      metadata: { category: 'drill', skill: 'post moves' }
    },
    {
      id: 'drill-pickroll',
      text: 'The Pick and Roll Read Drill trains ball handlers to read the defense. Screener sets the screen. Coach calls "hedge", "drop", or "switch" as the ball handler uses the screen — they must react and make the correct play for each defensive coverage. Builds the ability to read and react in real time.',
      metadata: { category: 'drill', skill: 'pick and roll reads' }
    },
    {
      id: 'drill-3man-weave',
      text: 'The 3 Man Weave Drill improves passing, cutting, and transition decision making. Three players start at half court and pass and cut to the basket without dribbling. The player who passes must cut behind the receiver. Finishes with a layup. Teaches players to pass and move, read teammates, and make quick decisions in transition.',
      metadata: { category: 'drill', skill: 'transition and passing' }
    },
    {
      id: 'drill-defensive-slides',
      text: 'Defensive Slide Drill builds the footwork and conditioning for on-ball defense. Player starts in defensive stance at one elbow, slides to the other elbow, touches it, slides back. 5 sets of 10. Never cross your feet, stay low, and keep your hands active. Proper defensive footwork prevents reaching fouls and keeps the defender in position.',
      metadata: { category: 'drill', skill: 'defense' }
    },
    {
      id: 'drill-offhand-layup',
      text: 'The Off Hand Layup Drill forces players to finish with their weak hand. Place a cone on the right side of the basket. Player must approach from the right and finish with their LEFT hand, and vice versa. 20 makes from each side per session. This is the fastest way to eliminate the one-handed tendency.',
      metadata: { category: 'drill', skill: 'weak hand finishing' }
    },
    {
      id: 'drill-pull-up',
      text: 'The One Dribble Pull Up Drill builds the pull up jumper off the dribble. Start at the three point line, take exactly ONE hard dribble, and pull up immediately. Focus on landing balanced, squaring the hips, and releasing at the top of the jump. 10 makes from 5 spots. Teaches efficiency and balance on the pull up.',
      metadata: { category: 'drill', skill: 'pull up jumper' }
    },
    {
      id: 'drill-shot-fake',
      text: 'The Shot Fake and Attack Drill teaches players to use the shot fake effectively. Start 15 feet from the basket. Pump fake — full motion, ball goes up to eye level, head goes up. If defender bites, take one dribble and attack. If not, shoot. Do this drill against live defenders so players learn what a real bite looks like.',
      metadata: { category: 'drill', skill: 'shot fake' }
    },

    // ─── GENERAL COACHING PHILOSOPHY ────────────────────────────────

    {
      id: 'philosophy-001',
      text: 'The best shot is not always the most difficult shot. High percentage shots come from good spacing, player movement, and reading the defense — not from individual brilliance. A wide open layup is always better than a contested three. Teach players to value shot quality over shot difficulty.',
      metadata: { category: 'general' }
    },
    {
      id: 'philosophy-002',
      text: 'Turnovers at the high school level are more damaging than missed shots. A missed shot gives your team a chance for an offensive rebound. A turnover gives the opponent easy transition points. Players should be coached to protect the ball at all times — especially in traffic and under pressure.',
      metadata: { category: 'general' }
    },
    {
      id: 'philosophy-003',
      text: 'Defense wins games at the high school level. Most high school offenses are inconsistent — but a team that plays disciplined, connected defense can control games regardless of their offensive execution. Defensive effort, positioning, and communication are always coachable regardless of athletic ability.',
      metadata: { category: 'general' }
    },
    {
      id: 'philosophy-004',
      text: 'The first option should always be to attack the basket. Modern basketball is built around getting to the free throw line and finishing at the rim. Teach players to be aggressive first — pull up jumpers and threes are the secondary option after the defense takes away the drive.',
      metadata: { category: 'general' }
    },
    {
      id: 'philosophy-005',
      text: 'High school players should score 60-82 on most plays. Scores above 85 should be reserved for near-perfect execution with elite decision making and finishing. Inflated scores do not help players improve. Honest, calibrated feedback is what builds better players.',
      metadata: { category: 'general' }
    },
  ];

  console.log(`🏀 Seeding ${knowledge.length} entries into CourtIQ Brain...`);

  let success = 0;
  let failed = 0;

  for (const item of knowledge) {
    try {
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: item.text
      });

      const values = embeddingResponse.data[0].embedding;

      await index.upsert({
        records: [{
          id: item.id,
          values,
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
