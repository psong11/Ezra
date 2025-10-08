#!/usr/bin/env node
/**
 * Test TTS with cleaned Hebrew text (no cantillation marks)
 */

async function testCleanedHebrewTTS() {
  console.log('🧪 Testing TTS with Cleaned Hebrew Text\n');

  const BASE_URL = 'http://localhost:3000';
  
  // Original text with cantillation
  const original = 'בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ׃';
  
  // Cleaned text (cantillation removed, niqqud kept)
  const cleaned = 'בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ׃';

  console.log('📖 Genesis 1:1\n');
  console.log('Original:', original);
  console.log('Original length:', original.length, 'chars\n');
  console.log('Cleaned:', cleaned);
  console.log('Cleaned length:', cleaned.length, 'chars\n');

  // Test original
  console.log('1️⃣  Testing ORIGINAL text (with cantillation)...');
  try {
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: original,
        languageCode: 'he-IL',
        voiceName: 'he-IL-Wavenet-A',
      }),
    });

    const duration = Date.now() - startTime;
    
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      console.log(`✅ Success in ${duration}ms`);
      console.log(`   Audio size: ${(buffer.byteLength / 1024).toFixed(2)} KB`);
      console.log(`   Bytes per char: ${(buffer.byteLength / original.length).toFixed(0)}\n`);
    } else {
      const error = await response.json();
      console.log(`❌ Error:`, error, '\n');
    }
  } catch (error: any) {
    console.log(`❌ Error:`, error.message, '\n');
  }

  // Test cleaned
  console.log('2️⃣  Testing CLEANED text (no cantillation)...');
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
    
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      console.log(`✅ Success in ${duration}ms`);
      console.log(`   Audio size: ${(buffer.byteLength / 1024).toFixed(2)} KB`);
      console.log(`   Bytes per char: ${(buffer.byteLength / cleaned.length).toFixed(0)}\n`);
    } else {
      const error = await response.json();
      console.log(`❌ Error:`, error, '\n');
    }
  } catch (error: any) {
    console.log(`❌ Error:`, error.message, '\n');
  }

  console.log('📊 Analysis:');
  console.log('   - Original has cantillation marks (te\'amim) that make TTS read letter-by-letter');
  console.log('   - Cleaned version should have ~50% smaller audio and sound more natural');
  console.log('   - Both preserve niqqud (vowel points) for proper pronunciation\n');

  console.log('✨ Test complete!');
}

testCleanedHebrewTTS();
