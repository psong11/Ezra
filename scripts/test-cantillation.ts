#!/usr/bin/env node
/**
 * Test Hebrew TTS with and without cantillation marks
 */

import { TextToSpeechClient } from '@google-cloud/text-to-speech';

function removeCantillationMarks(text: string): string {
  const cantillationPattern = /[\u0591-\u05AF\u05BD\u05BF]/g;
  return text.replace(cantillationPattern, '');
}

function removeAllDiacritics(text: string): string {
  const diacriticsPattern = /[\u0591-\u05C7]/g;
  return text.replace(diacriticsPattern, '');
}

async function testCantillationEffect() {
  console.log('🔍 Testing Effect of Cantillation Marks on Hebrew TTS\n');

  const client = new TextToSpeechClient();

  const original = 'בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ׃';
  const noCantillation = removeCantillationMarks(original);
  const noDiacritics = removeAllDiacritics(original);

  console.log('📖 Genesis 1:1 - Three versions:\n');
  console.log('1. Original (with cantillation):', original);
  console.log('   Length:', original.length, '\n');
  
  console.log('2. Without cantillation (keep niqqud):', noCantillation);
  console.log('   Length:', noCantillation.length, '\n');
  
  console.log('3. Without all diacritics (bare letters):', noDiacritics);
  console.log('   Length:', noDiacritics.length, '\n');

  // Test all three versions
  const versions = [
    { name: 'Original', text: original },
    { name: 'No Cantillation', text: noCantillation },
    { name: 'No Diacritics', text: noDiacritics },
  ];

  for (const version of versions) {
    console.log(`🎤 Testing: ${version.name}`);
    
    try {
      const request = {
        input: { text: version.text },
        voice: { 
          languageCode: 'he-IL',
          name: 'he-IL-Wavenet-A'
        },
        audioConfig: { audioEncoding: 'MP3' as const },
      };
      
      const [response] = await client.synthesizeSpeech(request);
      const size = response.audioContent?.length || 0;
      console.log(`✅ Success: ${size} bytes`);
      console.log(`📊 Ratio: ${(size / version.text.length).toFixed(2)} bytes/char\n`);
    } catch (error: any) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }

  console.log('✨ Cantillation test complete!');
  console.log('\n💡 Recommendation:');
  console.log('   If audio sizes are similar, cantillation marks don\'t affect TTS.');
  console.log('   If audio size drops significantly without cantillation, remove them for better quality.');
}

testCantillationEffect();
