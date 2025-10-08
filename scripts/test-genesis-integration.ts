#!/usr/bin/env node
/**
 * Test the Genesis Bible integration
 */

async function testGenesisIntegration() {
  console.log('🧪 Testing Genesis Bible Integration\n');

  const BASE_URL = 'http://localhost:3000';

  // Test 1: Bible home page
  console.log('1️⃣  Testing /bible page...');
  try {
    const response = await fetch(`${BASE_URL}/bible`);
    if (response.ok) {
      const html = await response.text();
      if (html.includes('בראשית') || html.includes('Genesis')) {
        console.log('✅ Bible page loads with Genesis card\n');
      } else {
        console.log('⚠️  Bible page loads but Genesis not found\n');
      }
    } else {
      console.log(`❌ Failed: ${response.status}\n`);
    }
  } catch (error: any) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  // Test 2: Genesis book page
  console.log('2️⃣  Testing /bible/genesis page...');
  try {
    const response = await fetch(`${BASE_URL}/bible/genesis`);
    if (response.ok) {
      const html = await response.text();
      if (html.includes('Chapter')) {
        console.log('✅ Genesis chapter selector page loads\n');
      } else {
        console.log('⚠️  Genesis page loads but chapters not found\n');
      }
    } else {
      console.log(`❌ Failed: ${response.status}\n`);
    }
  } catch (error: any) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  // Test 3: Genesis Chapter 1
  console.log('3️⃣  Testing /bible/genesis/1 page...');
  try {
    const response = await fetch(`${BASE_URL}/bible/genesis/1`);
    if (response.ok) {
      const html = await response.text();
      if (html.includes('בְּרֵאשִׁ֖ית') || html.includes('Genesis 1')) {
        console.log('✅ Genesis Chapter 1 loads with Hebrew text\n');
      } else {
        console.log('⚠️  Genesis Chapter 1 loads but text not found\n');
      }
    } else {
      console.log(`❌ Failed: ${response.status}\n`);
    }
  } catch (error: any) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  // Test 4: TTS for Hebrew verse
  console.log('4️⃣  Testing TTS with Hebrew text...');
  try {
    const response = await fetch(`${BASE_URL}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ׃',
        languageCode: 'he-IL',
        voiceName: 'he-IL-Wavenet-A',
        model: 'wavenet',
      }),
    });

    if (response.ok) {
      const buffer = await response.arrayBuffer();
      console.log(`✅ TTS generated: ${buffer.byteLength} bytes\n`);
    } else {
      const error = await response.json();
      console.log(`❌ TTS failed: ${error.error}\n`);
    }
  } catch (error: any) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  console.log('🎉 Integration test complete!');
}

testGenesisIntegration();
