const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function main() {
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const index = pinecone.index('courtiq-brain');

  const knowledge = [
    {
      id: 'shot-001',
      text: 'A pull up jumper with a defender within 2 feet is a BAD SHOT. The player should have attacked the basket instead or kicked it out to an open teammate. This is one of the most common bad habits in high school basketball — players fall in love with their mid range when the defense is right there.',
      metadata: { category: 'shot_quality', play_type: 'pull up jumper', verdict: 'BAD SHOT' }
    },
    {
      id: 'shot-002',
      text: 'A catch and shoot three pointer with 4+ feet of space and feet set is a GOOD SHOT. This is exactly what spacing is designed to create. The player should be confident taking this shot every time.',
      metadata: { category: 'shot_quality', play_type: 'catch and shoot', verdict: 'GOOD SHOT' }
    },
    {
      id: 'shot-003',
      text: 'A mid range jumper off the dribble with a trailing defender is a GOOD SHOT. The player has created separation and earned a quality look. This is good shot creation.',
      metadata: { category: 'shot_quality', play_type: 'mid range jumper', verdict: 'GOOD SHOT' }
    },
    {
      id: 'shot-004',
      text: 'A three pointer with a closeout defender in your face is a BAD SHOT at the high school level unless you are an elite shooter. The player should pump fake, attack the closeout, or kick it out.',
      metadata: { category: 'shot_quality', play_type: '3 pointer', verdict: 'BAD SHOT' }
    },
    {
      id: 'decision-001',
      text: 'When a player drives and collapses the defense but does not kick out to the open corner shooter, that is a WRONG DECISION. Reading the help defense and finding the open man is a fundamental skill. The player was selfish or did not see the open teammate.',
      metadata: { category: 'decision_making', verdict: 'WRONG DECISION' }
    },
    {
      id: 'decision-002',
      text: 'When a point guard pushes in transition and attacks before the defense is set, that is a RIGHT DECISION. Getting easy transition baskets is one of the highest value plays in basketball. Hesitating in transition lets the defense recover.',
      metadata: { category: 'decision_making', verdict: 'RIGHT DECISION' }
    },
    {
      id: 'positioning-001',
      text: 'Weak side players standing in the corner create spacing and keep the defense honest. This is correct offensive positioning. If weak side players collapse into the paint, they clog driving lanes and make it harder for the ball handler.',
      metadata: { category: 'positioning', side: 'offense' }
    },
    {
      id: 'positioning-002',
      text: 'A defender who is ball watching and loses their man on the weak side is out of position defensively. This leads to easy backdoor cuts and open threes. Off ball defense requires constant awareness of both the ball and your assigned player.',
      metadata: { category: 'positioning', side: 'defense' }
    },
    {
      id: 'drill-001',
      text: 'The Mikan Drill is used to improve finishing at the rim. The player alternates layups from each side of the basket without letting the ball hit the floor. 3 sets of 20 reps builds touch and ambidexterity around the basket.',
      metadata: { category: 'drill', skill: 'finishing' }
    },
    {
      id: 'drill-002',
      text: 'The 3 Man Weave drill improves passing, cutting, and transition decision making. Three players start at half court and pass and cut to the basket without dribbling. This teaches players to read teammates and make quick decisions.',
      metadata: { category: 'drill', skill: 'passing' }
    },
    {
      id: 'habit-001',
      text: 'A player who consistently takes pull up jumpers in the mid range when they have the ability to get to the rim has developed a comfort zone habit. This is common in high school players who are afraid of contact. The fix is to practice driving all the way through contact in practice.',
      metadata: { category: 'habit', type: 'bad' }
    },
    {
      id: 'habit-002',
      text: 'A player who consistently attacks closeouts off the catch is developing an elite habit. This puts defenders in foul trouble and creates easy baskets. This should be reinforced and practiced regularly.',
      metadata: { category: 'habit', type: 'good' }
    }
  ];

  console.log('🏀 Building CourtIQ Basketball Brain...');

  for (const item of knowledge) {
    console.log(`Processing: ${item.id}`);

    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: item.text
    });

    const values = embeddingResponse.data[0].embedding;
    console.log(`Got embedding with ${values.length} dimensions`);

    await index.upsert({
  records: [{
    id: item.id,
    values: values,
    metadata: { ...item.metadata, text: item.text }
  }]
});

    console.log(`✅ Stored: ${item.id}`);
  }

  console.log('🎉 Basketball Brain is ready!');
}

main().catch(console.error);
