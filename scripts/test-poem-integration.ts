#!/usr/bin/env node
/**
 * Simulate the exact flow that happens when playing TTS from a poem page
 */

const PORTS = [3000, 3001, 3002, 3005];

async function findServer() {
  for (const port of PORTS) {
    try {
      const response = await fetch(`http://localhost:${port}/api/voices`, { 
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });
      if (response.ok) {
        return `http://localhost:${port}`;
      }
    } catch (error) {
      // Try next port
    }
  }
  throw new Error('No server found');
}

async function testPoemTTS(baseUrl: string, poemId: string) {
  console.log(`\n📖 Testing poem: ${poemId}`);
  
  // Step 1: Fetch the poem (simulating what the page does)
  console.log('  1️⃣  Fetching poem...');
  const poemResponse = await fetch(`${baseUrl}/api/poems/${poemId}`);
  if (!poemResponse.ok) {
    throw new Error(`Failed to fetch poem: ${poemResponse.status}`);
  }
  const poem = await poemResponse.json();
  console.log(`     ✅ Got poem: "${poem.title}" (${poem.language})`);
  
  // Step 2: Simulate what getLanguageCodeFromPoemId would return
  const languageCodeMap: Record<string, string> = {
    'arabic': 'ar-SA',
    'chinese': 'zh-CN',
    'english': 'en-US',
    'english-australia': 'en-AU',
    'french': 'fr-FR',
    'german': 'de-DE',
    'japanese': 'ja-JP',
    'spanish': 'es-ES',
  };
  
  const cleanId = poem.id.replace('-rtl', '');
  const languageCode = languageCodeMap[cleanId] || 'en-US';
  console.log(`  2️⃣  Determined language code: ${languageCode}`);
  
  // Step 3: Make TTS request (simulating what TTSControls does)
  console.log('  3️⃣  Requesting TTS synthesis...');
  const ttsResponse = await fetch(`${baseUrl}/api/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: poem.content.substring(0, 100), // Use first 100 chars
      languageCode: languageCode,
      audioEncoding: 'MP3',
      speakingRate: 1.0,
      pitch: 0.0,
    }),
  });
  
  if (!ttsResponse.ok) {
    const error = await ttsResponse.json();
    console.error(`     ❌ TTS failed:`, error);
    return false;
  }
  
  const audioBuffer = await ttsResponse.arrayBuffer();
  const cacheHit = ttsResponse.headers.get('X-Cache-Hit');
  console.log(`     ✅ TTS succeeded: ${audioBuffer.byteLength} bytes (cache: ${cacheHit})`);
  
  return true;
}

async function main() {
  try {
    console.log('🧪 Testing Poem TTS Integration\n');
    console.log('This simulates clicking play on poem pages...\n');
    
    const BASE_URL = await findServer();
    console.log(`✅ Found server at ${BASE_URL}`);
    
    const testPoems = [
      'english',
      'english-australia',
      'french',
      'german',
      'japanese',
      'spanish',
      'arabic-rtl',
      'chinese',
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const poemId of testPoems) {
      try {
        const result = await testPoemTTS(BASE_URL, poemId);
        if (result) {
          passed++;
        } else {
          failed++;
        }
      } catch (error: any) {
        console.error(`  ❌ Error:`, error.message);
        failed++;
      }
    }
    
    console.log(`\n📊 Results: ${passed}/${testPoems.length} poems working`);
    
    if (failed > 0) {
      console.log('\n❌ Some tests failed');
      process.exit(1);
    } else {
      console.log('\n🎉 All poem TTS requests working!');
      console.log('\n✅ You can now safely use TTS on any poem page in the browser');
    }
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();
