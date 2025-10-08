#!/usr/bin/env node
/**
 * Debug Hebrew TTS specifically
 */

import { TextToSpeechClient } from '@google-cloud/text-to-speech';

async function testHebrewDirect() {
  console.log('🔍 Testing Hebrew TTS Directly with Google API\n');

  const client = new TextToSpeechClient();

  // Genesis 1:1 text from our JSON
  const verse1 = 'בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ׃';
  
  console.log('📖 Testing Genesis 1:1');
  console.log('Hebrew text:', verse1);
  console.log('Length:', verse1.length, 'characters\n');

  // Test 1: With Wavenet voice
  console.log('1️⃣  Testing with he-IL-Wavenet-A...');
  try {
    const request1 = {
      input: { text: verse1 },
      voice: { 
        languageCode: 'he-IL',
        name: 'he-IL-Wavenet-A'
      },
      audioConfig: { audioEncoding: 'MP3' as const },
    };
    
    console.log('Request:', JSON.stringify(request1, null, 2));
    
    const [response1] = await client.synthesizeSpeech(request1);
    console.log('✅ Success:', response1.audioContent?.length, 'bytes\n');
  } catch (error: any) {
    console.log('❌ Error:', error.message);
    console.log('Error code:', error.code);
    console.log('Error details:', error.details, '\n');
  }

  // Test 2: Without voice name (auto-select)
  console.log('2️⃣  Testing without voice name (auto-select)...');
  try {
    const request2 = {
      input: { text: verse1 },
      voice: { 
        languageCode: 'he-IL'
      },
      audioConfig: { audioEncoding: 'MP3' as const },
    };
    
    const [response2] = await client.synthesizeSpeech(request2);
    console.log('✅ Success:', response2.audioContent?.length, 'bytes\n');
  } catch (error: any) {
    console.log('❌ Error:', error.message, '\n');
  }

  // Test 3: With model parameter
  console.log('3️⃣  Testing with model parameter...');
  try {
    const request3 = {
      input: { text: verse1 },
      voice: { 
        languageCode: 'he-IL',
        name: 'he-IL-Wavenet-A',
        model: 'wavenet'
      },
      audioConfig: { audioEncoding: 'MP3' as const },
    };
    
    console.log('Request:', JSON.stringify(request3, null, 2));
    
    const [response3] = await client.synthesizeSpeech(request3);
    console.log('✅ Success:', response3.audioContent?.length, 'bytes\n');
  } catch (error: any) {
    console.log('❌ Error:', error.message);
    console.log('Error code:', error.code);
    console.log('Error details:', error.details, '\n');
  }

  // Test 4: Simple Hebrew without cantillation marks
  const simpleHebrew = 'בראשית ברא אלהים את השמים ואת הארץ';
  console.log('4️⃣  Testing simple Hebrew (no cantillation marks)...');
  console.log('Text:', simpleHebrew);
  try {
    const request4 = {
      input: { text: simpleHebrew },
      voice: { 
        languageCode: 'he-IL',
        name: 'he-IL-Wavenet-A'
      },
      audioConfig: { audioEncoding: 'MP3' as const },
    };
    
    const [response4] = await client.synthesizeSpeech(request4);
    console.log('✅ Success:', response4.audioContent?.length, 'bytes\n');
  } catch (error: any) {
    console.log('❌ Error:', error.message, '\n');
  }

  // Test 5: Full chapter 1
  console.log('5️⃣  Testing full Genesis chapter 1...');
  const chapter1Verses = [
    'בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ׃',
    'וְהָאָ֗רֶץ הָיְתָ֥ה תֹ֙הוּ֙ וָבֹ֔הוּ וְחֹ֖שֶׁךְ עַל־ פְּנֵ֣י תְה֑וֹם וְר֣וּחַ אֱלֹהִ֔ים מְרַחֶ֖פֶת עַל־ פְּנֵ֥י הַמָּֽיִם׃',
    'וַיֹּ֥אמֶר אֱלֹהִ֖ים יְהִ֣י א֑וֹר וַֽיְהִי־אֽוֹר׃'
  ];
  const fullText = chapter1Verses.join(' ');
  console.log('Text length:', fullText.length, 'characters');
  
  try {
    const request5 = {
      input: { text: fullText },
      voice: { 
        languageCode: 'he-IL',
        name: 'he-IL-Wavenet-A'
      },
      audioConfig: { audioEncoding: 'MP3' as const },
    };
    
    const [response5] = await client.synthesizeSpeech(request5);
    console.log('✅ Success:', response5.audioContent?.length, 'bytes\n');
  } catch (error: any) {
    console.log('❌ Error:', error.message);
    console.log('Error code:', error.code, '\n');
  }

  console.log('✨ Hebrew TTS debug complete!');
}

testHebrewDirect();
