/**
 * Google TTS Integration Test Script
 * Tests the Google Cloud Text-to-Speech functionality
 */

import { GoogleTTSClient } from '../src/lib/tts/google';
import { writeFile } from 'fs/promises';
import { join } from 'path';

async function testGoogleTTS() {
  console.log('🧪 Testing Google Cloud Text-to-Speech...\n');

  try {
    // 1. Test client initialization
    console.log('1️⃣  Initializing Google TTS Client...');
    const client = new GoogleTTSClient();
    console.log('✅ Client initialized successfully\n');

    // 2. Test listing voices
    console.log('2️⃣  Fetching available voices...');
    const voices = await client.listVoices();
    console.log(`✅ Retrieved ${voices.length} voices`);
    
    // Show sample voices
    const sampleVoices = voices.slice(0, 5);
    console.log('\nSample voices:');
    sampleVoices.forEach(voice => {
      console.log(`  - ${voice.name} (${voice.languageCodes?.[0]}, ${voice.ssmlGender})`);
    });
    console.log('');

    // 3. Test basic synthesis
    console.log('3️⃣  Testing basic text synthesis...');
    const text = 'Hello, this is a test of the Google Text-to-Speech API.';
    const audioBuffer = await client.synthesize({
      text,
      languageCode: 'en-US',
      audioEncoding: 'MP3',
    });
    console.log(`✅ Synthesized ${audioBuffer.length} bytes of audio\n`);

    // Save test audio file
    const outputPath = join(process.cwd(), 'test-output.mp3');
    await writeFile(outputPath, audioBuffer);
    console.log(`💾 Saved test audio to: ${outputPath}\n`);

    // 4. Test with specific voice (use a standard voice, not Journey)
    console.log('4️⃣  Testing synthesis with specific voice...');
    const enVoice = voices.find(v => 
      v.languageCodes?.[0] === 'en-US' && 
      v.name && 
      v.name.includes('-') // Standard voices have dashes
    );
    if (enVoice) {
      console.log(`   Using voice: ${enVoice.name}`);
      const voiceAudio = await client.synthesize({
        text,
        voiceName: enVoice.name!,
        languageCode: 'en-US',
        audioEncoding: 'MP3',
      });
      console.log(`✅ Synthesized ${voiceAudio.length} bytes with voice ${enVoice.name}\n`);
    } else {
      console.log('⚠️  No standard English voice found, skipping test\n');
    }

    // 5. Test with different audio parameters
    console.log('5️⃣  Testing synthesis with custom parameters...');
    const customAudio = await client.synthesize({
      text,
      languageCode: 'en-US',
      audioEncoding: 'MP3',
      speakingRate: 1.2,
      pitch: 2.0,
      volumeGainDb: -5.0,
    });
    console.log(`✅ Synthesized ${customAudio.length} bytes with custom parameters\n`);

    // 6. Test text chunking
    console.log('6️⃣  Testing long text (chunking)...');
    const longText = 'This is a test sentence. '.repeat(100); // Create moderately long text
    const longAudio = await client.synthesize({
      text: longText,
      languageCode: 'en-US',
      audioEncoding: 'MP3',
    });
    console.log(`✅ Synthesized ${longAudio.length} bytes for long text\n`);

    // 7. Test SSML
    console.log('7️⃣  Testing SSML input...');
    const ssml = `
      <speak>
        Hello, <emphasis level="strong">this is important</emphasis>.
        <break time="500ms"/>
        And this is after a pause.
      </speak>
    `;
    const ssmlAudio = await client.synthesize({
      ssml,
      languageCode: 'en-US',
      audioEncoding: 'MP3',
    });
    console.log(`✅ Synthesized ${ssmlAudio.length} bytes from SSML\n`);

    // 8. Test error handling
    console.log('8️⃣  Testing error handling...');
    try {
      await client.synthesize({
        text: '',
        languageCode: 'en-US',
      });
      console.log('❌ Should have thrown error for empty text\n');
    } catch (error: any) {
      console.log(`✅ Correctly caught error: ${error.message}\n`);
    }

    console.log('🎉 All tests passed!\n');
    return true;

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    return false;
  }
}

// Run tests
testGoogleTTS()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
