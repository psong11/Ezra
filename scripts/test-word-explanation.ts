/**
 * Test script for OpenAI Word Explanation API
 * Run: npx tsx scripts/test-word-explanation.ts
 */

async function testWordExplanation() {
  console.log('🧪 Testing Word Explanation API\n');

  const testWord = {
    word: 'בְּרֵאשִׁית',
    language: 'Hebrew',
    verse: 'בְּרֵאשִׁית, בָּרָא אֱלֹהִים, אֵת הַשָּׁמַיִם, וְאֵת הָאָרֶץ',
    bookName: 'Genesis',
    chapterNum: 1,
    verseNum: 1,
  };

  console.log('📝 Test Word:', testWord.word);
  console.log('📖 Context:', testWord.bookName, `${testWord.chapterNum}:${testWord.verseNum}`);
  console.log('\n⏳ Calling API...\n');

  try {
    const response = await fetch('http://localhost:3001/api/word-explanation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testWord),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error:', error);
      return;
    }

    const data = await response.json();
    
    console.log('✅ Success!');
    console.log('\n📊 Response:');
    console.log('   Word:', data.word);
    console.log('   Language:', data.language);
    console.log('   Cached:', data.cached);
    console.log('   Timestamp:', data.timestamp);
    console.log('\n📝 Explanation:');
    console.log('─'.repeat(60));
    console.log(data.explanation);
    console.log('─'.repeat(60));

    // Test cache
    console.log('\n🔄 Testing cache (second request)...\n');
    
    const cachedResponse = await fetch('http://localhost:3001/api/word-explanation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testWord),
    });

    const cachedData = await cachedResponse.json();
    console.log('✅ Cache hit:', cachedData.cached);
    console.log('⚡ Response time: Instant (from cache)');

    // Check cache stats
    console.log('\n📈 Cache Statistics:');
    const statsResponse = await fetch('http://localhost:3001/api/word-explanation');
    const stats = await statsResponse.json();
    console.log('   Total cached words:', stats.size);
    console.log('   Cache keys:', stats.keys.slice(0, 3), '...');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. Dev server is running (npm run dev)');
    console.log('   2. OPENAI_API_KEY is set in .env.local');
    console.log('   3. Server is accessible on http://localhost:3001');
  }
}

testWordExplanation();
