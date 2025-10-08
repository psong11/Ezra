#!/usr/bin/env node
/**
 * Test full Genesis Chapter 1 through the API endpoint
 */

import genesisData from '../src/data/bible/hebrew/genesis.json' assert { type: 'json' };

function removeCantillationMarks(text: string): string {
  const cantillationPattern = /[\u0591-\u05AF\u05BD\u05BF]/g;
  return text.replace(cantillationPattern, '');
}

async function testFullChapterAPI() {
  console.log('🧪 Testing Full Genesis Chapter 1 via API\n');

  const BASE_URL = 'http://localhost:3000';
  
  // Get full chapter 1
  const chapter1 = genesisData.chapters[0];
  const fullText = chapter1.verses.map((v: any) => v.text).join(' ');
  const cleaned = removeCantillationMarks(fullText);

  console.log('📖 Genesis Chapter 1:');
  console.log('   Verses:', chapter1.verses.length);
  console.log('   Original:', Buffer.byteLength(fullText, 'utf8'), 'bytes');
  console.log('   Cleaned:', Buffer.byteLength(cleaned, 'utf8'), 'bytes');
  console.log('   Exceeds 5000 byte limit?', Buffer.byteLength(cleaned, 'utf8') > 5000 ? 'YES ✓' : 'NO');
  console.log('\n');

  console.log('🎤 Sending to TTS API...\n');

  try {
    const startTime = Date.now();
    
    const response = await fetch(`${BASE_URL}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleaned,
        languageCode: 'he-IL',
        voiceName: 'he-IL-Wavenet-A',
      }),
    });

    const duration = Date.now() - startTime;

    console.log('Response status:', response.status);
    console.log('Duration:', duration, 'ms\n');

    if (response.ok) {
      const buffer = await response.arrayBuffer();
      console.log('✅ SUCCESS!');
      console.log('   Audio size:', (buffer.byteLength / 1024).toFixed(2), 'KB');
      console.log('   Duration:', (duration / 1000).toFixed(1), 'seconds');
      console.log('\n💡 The chunking worked! Audio was generated successfully.');
    } else {
      const error = await response.json();
      console.log('❌ ERROR:');
      console.log(JSON.stringify(error, null, 2));
      console.log('\n💡 The chunking may not be working correctly.');
    }
  } catch (error: any) {
    console.log('❌ REQUEST FAILED:', error.message);
  }

  console.log('\n✨ Test complete!');
}

testFullChapterAPI();
