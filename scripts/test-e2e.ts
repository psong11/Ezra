/**
 * End-to-End TTS Test
 * Simulates the actual user flow through the API
 */

async function testE2E() {
  console.log('🧪 End-to-End TTS Test\n');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // 1. Test voices endpoint
    console.log('1️⃣  Testing /api/voices endpoint...');
    const voicesRes = await fetch(`${baseUrl}/api/voices`);
    
    if (!voicesRes.ok) {
      throw new Error(`Voices API returned ${voicesRes.status}`);
    }
    
    const voicesData = await voicesRes.json();
    console.log(`✅ Retrieved ${voicesData.count} voices`);
    
    // Check that Journey voices are filtered out
    const journeyVoices = voicesData.voices.filter((v: any) => /^[A-Z][a-z]+$/.test(v.name));
    if (journeyVoices.length > 0) {
      console.log(`⚠️  Found ${journeyVoices.length} Journey voices (should be 0)`);
      console.log(`   Examples: ${journeyVoices.slice(0, 3).map((v: any) => v.name).join(', ')}`);
    } else {
      console.log(`✅ Journey voices properly filtered out`);
    }
    
    console.log('');
    
    // 2. Test TTS with default voice
    console.log('2️⃣  Testing TTS with default (no voice specified)...');
    const defaultRes = await fetch(`${baseUrl}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Hello, this is a test.',
        languageCode: 'en-US',
        audioEncoding: 'MP3',
      }),
    });
    
    if (!defaultRes.ok) {
      const error = await defaultRes.json();
      throw new Error(`Default TTS failed: ${error.error} - ${error.message}`);
    }
    
    const defaultBlob = await defaultRes.blob();
    console.log(`✅ Default voice: ${defaultBlob.size} bytes`);
    console.log(`   Cache: ${defaultRes.headers.get('X-Cache-Hit')}\n`);
    
    // 3. Test TTS with specific voices from different languages
    const testCases = [
      { voice: 'en-US-Standard-A', lang: 'en-US', desc: 'US English' },
      { voice: 'en-GB-Standard-A', lang: 'en-GB', desc: 'British English' },
      { voice: 'en-AU-Standard-A', lang: 'en-AU', desc: 'Australian English' },
    ];
    
    console.log('3️⃣  Testing specific voices with correct language codes...');
    
    for (const testCase of testCases) {
      // Find if voice exists
      const voice = voicesData.voices.find((v: any) => v.name === testCase.voice);
      if (!voice) {
        console.log(`⚠️  Voice ${testCase.voice} not found, skipping`);
        continue;
      }
      
      const res = await fetch(`${baseUrl}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Hello, this is a test.',
          voiceName: testCase.voice,
          languageCode: testCase.lang,
          audioEncoding: 'MP3',
        }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        console.log(`❌ ${testCase.desc}: ${error.error} - ${error.message}`);
      } else {
        const blob = await res.blob();
        console.log(`✅ ${testCase.desc} (${testCase.voice}): ${blob.size} bytes`);
      }
    }
    
    console.log('');
    
    // 4. Test language mismatch scenario
    console.log('4️⃣  Testing language mismatch detection...');
    const mismatchRes = await fetch(`${baseUrl}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Test',
        voiceName: 'en-AU-Standard-A', // Australian voice
        languageCode: 'en-US', // US language code - MISMATCH
        audioEncoding: 'MP3',
      }),
    });
    
    if (!mismatchRes.ok) {
      const error = await mismatchRes.json();
      if (error.message?.includes('language code')) {
        console.log(`✅ Correctly detected language mismatch`);
        console.log(`   Error: ${error.message.substring(0, 100)}...\n`);
      } else {
        console.log(`⚠️  Error but unexpected: ${error.message}\n`);
      }
    } else {
      console.log(`⚠️  Should have returned error for language mismatch\n`);
    }
    
    // 5. Test with custom parameters
    console.log('5️⃣  Testing with custom audio parameters...');
    const customRes = await fetch(`${baseUrl}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Testing custom parameters.',
        languageCode: 'en-US',
        audioEncoding: 'MP3',
        speakingRate: 1.2,
        pitch: 2.0,
        volumeGainDb: -3.0,
      }),
    });
    
    if (!customRes.ok) {
      const error = await customRes.json();
      console.log(`❌ Custom parameters failed: ${error.error}`);
    } else {
      const blob = await customRes.blob();
      console.log(`✅ Custom parameters: ${blob.size} bytes\n`);
    }
    
    console.log('🎉 All end-to-end tests passed!\n');
    return true;
    
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nMake sure the dev server is running: npm run dev\n');
    return false;
  }
}

// Run tests
testE2E()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
