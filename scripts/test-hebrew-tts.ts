#!/usr/bin/env node
/**
 * Test Hebrew TTS with Genesis verses
 */

async function testHebrewTTS() {
  console.log('🎤 Testing Hebrew TTS with Genesis Verses\n');

  const BASE_URL = 'http://localhost:3000';

  const verses = [
    {
      reference: 'Genesis 1:1',
      text: 'בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ׃',
      english: 'In the beginning God created the heavens and the earth'
    },
    {
      reference: 'Genesis 1:3',
      text: 'וַיֹּ֥אמֶר אֱלֹהִ֖ים יְהִ֣י א֑וֹר וַֽיְהִי־אֽוֹר׃',
      english: 'And God said, Let there be light: and there was light'
    },
    {
      reference: 'Genesis 22:2',
      text: 'וַיֹּ֡אמֶר קַח־נָ֠א אֶת־בִּנְךָ֨ אֶת־יְחִֽידְךָ֤ אֲשֶׁר־אָהַ֙בְתָּ֙ אֶת־יִצְחָ֔ק',
      english: 'And he said, Take now thy son, thine only son Isaac, whom thou lovest'
    }
  ];

  for (const verse of verses) {
    console.log(`📖 ${verse.reference}`);
    console.log(`   ${verse.english}\n`);

    try {
      const startTime = Date.now();

      const response = await fetch(`${BASE_URL}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: verse.text,
          languageCode: 'he-IL',
          voiceName: 'he-IL-Wavenet-A',
          model: 'wavenet',
        }),
      });

      const duration = Date.now() - startTime;

      if (response.ok) {
        const buffer = await response.arrayBuffer();
        console.log(`   ✅ Generated in ${duration}ms`);
        console.log(`   📊 Audio size: ${(buffer.byteLength / 1024).toFixed(2)} KB`);
        console.log(`   🎵 Duration: ~${Math.floor(buffer.byteLength / 16000)} seconds\n`);
      } else {
        const error = await response.json();
        console.log(`   ❌ Failed: ${error.error}\n`);
      }
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }

  console.log('✨ Hebrew TTS test complete!');
  console.log('\n💡 Tips:');
  console.log('   - Visit http://localhost:3000/bible/genesis/1');
  console.log('   - Click any verse number to hear it');
  console.log('   - Click "Listen to Full Chapter" for the whole chapter');
}

testHebrewTTS();
