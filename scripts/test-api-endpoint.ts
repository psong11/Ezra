#!/usr/bin/env node
/**
 * Test the /api/tts endpoint with Hebrew text
 */

async function testAPIEndpoint() {
  console.log('🧪 Testing /api/tts Endpoint with Hebrew\n');

  const BASE_URL = 'http://localhost:3000';
  
  const verse1 = 'בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ׃';

  // Test 1: With model parameter (the current broken way)
  console.log('1️⃣  Testing WITH model parameter (current implementation)...');
  try {
    const response = await fetch(`${BASE_URL}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: verse1,
        languageCode: 'he-IL',
        voiceName: 'he-IL-Wavenet-A',
        model: 'wavenet',
      }),
    });

    console.log('Status:', response.status);
    
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      console.log('✅ Success! Audio size:', buffer.byteLength, 'bytes\n');
    } else {
      const error = await response.json();
      console.log('❌ Error:', JSON.stringify(error, null, 2), '\n');
    }
  } catch (error: any) {
    console.log('❌ Request failed:', error.message, '\n');
  }

  // Test 2: WITHOUT model parameter (the fixed way)
  console.log('2️⃣  Testing WITHOUT model parameter (fixed)...');
  try {
    const response = await fetch(`${BASE_URL}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: verse1,
        languageCode: 'he-IL',
        voiceName: 'he-IL-Wavenet-A',
      }),
    });

    console.log('Status:', response.status);
    
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      console.log('✅ Success! Audio size:', buffer.byteLength, 'bytes\n');
    } else {
      const error = await response.json();
      console.log('❌ Error:', JSON.stringify(error, null, 2), '\n');
    }
  } catch (error: any) {
    console.log('❌ Request failed:', error.message, '\n');
  }

  // Test 3: Full chapter (multiple verses)
  const verses = [
    'בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ׃',
    'וְהָאָ֗רֶץ הָיְתָ֥ה תֹ֙הוּ֙ וָבֹ֔הוּ וְחֹ֖שֶׁךְ עַל־ פְּנֵ֣י תְה֑וֹם וְר֣וּחַ אֱלֹהִ֔ים מְרַחֶ֖פֶת עַל־ פְּנֵ֥י הַמָּֽיִם׃',
    'וַיֹּ֥אמֶר אֱלֹהִ֖ים יְהִ֣י א֑וֹר וַֽיְהִי־אֽוֹר׃'
  ];
  const fullText = verses.join(' ');

  console.log('3️⃣  Testing full chapter (3 verses)...');
  console.log('Text length:', fullText.length, 'characters');
  
  try {
    const response = await fetch(`${BASE_URL}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: fullText,
        languageCode: 'he-IL',
        voiceName: 'he-IL-Wavenet-A',
      }),
    });

    console.log('Status:', response.status);
    
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      console.log('✅ Success! Audio size:', buffer.byteLength, 'bytes\n');
    } else {
      const error = await response.json();
      console.log('❌ Error:', JSON.stringify(error, null, 2), '\n');
    }
  } catch (error: any) {
    console.log('❌ Request failed:', error.message, '\n');
  }

  console.log('✨ API endpoint test complete!');
}

testAPIEndpoint();
