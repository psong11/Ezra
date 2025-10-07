/**
 * Voice Compatibility Test
 * Tests that each voice can synthesize speech with its correct language code
 */

import { GoogleTTSClient } from '../src/lib/tts/google';

async function testVoiceCompatibility() {
  console.log('🧪 Testing Voice Compatibility...\n');

  const client = new GoogleTTSClient();
  
  try {
    // Get all voices
    console.log('1️⃣  Fetching voices...');
    const voices = await client.listVoices();
    
    // Filter to standard voices only (exclude Journey voices)
    const standardVoices = voices.filter(v => 
      v.name && v.name.includes('-') && v.languageCodes && v.languageCodes.length > 0
    );
    
    console.log(`✅ Found ${standardVoices.length} standard voices\n`);
    
    // Test a sample of voices from different languages
    const sampleVoices = [
      standardVoices.find(v => v.languageCodes?.[0] === 'en-US'),
      standardVoices.find(v => v.languageCodes?.[0] === 'en-GB'),
      standardVoices.find(v => v.languageCodes?.[0] === 'en-AU'),
      standardVoices.find(v => v.languageCodes?.[0] === 'es-ES'),
      standardVoices.find(v => v.languageCodes?.[0] === 'fr-FR'),
      standardVoices.find(v => v.languageCodes?.[0] === 'de-DE'),
    ].filter(Boolean);
    
    console.log('2️⃣  Testing sample voices from different languages...\n');
    
    let passed = 0;
    let failed = 0;
    
    for (const voice of sampleVoices) {
      if (!voice || !voice.name || !voice.languageCodes) continue;
      
      const voiceName = voice.name;
      const languageCode = voice.languageCodes[0];
      
      try {
        console.log(`Testing: ${voiceName} (${languageCode})`);
        
        // Test with correct language code
        const audio = await client.synthesize({
          text: 'Hello, this is a test.',
          voiceName,
          languageCode,
          audioEncoding: 'MP3',
        });
        
        if (audio.length > 0) {
          console.log(`✅ ${voiceName}: ${audio.length} bytes\n`);
          passed++;
        }
      } catch (error: any) {
        console.error(`❌ ${voiceName}: ${error.message}\n`);
        failed++;
      }
    }
    
    console.log('3️⃣  Testing language mismatch error handling...\n');
    
    // Test that wrong language code produces clear error
    const testVoice = standardVoices.find(v => v.languageCodes?.[0] === 'en-AU');
    if (testVoice) {
      try {
        console.log(`Testing language mismatch: ${testVoice.name} with en-US`);
        await client.synthesize({
          text: 'Test',
          voiceName: testVoice.name!,
          languageCode: 'en-US', // Wrong language code
          audioEncoding: 'MP3',
        });
        console.log('❌ Should have thrown error for language mismatch\n');
      } catch (error: any) {
        if (error.message.includes('language code')) {
          console.log(`✅ Correctly caught language mismatch error\n`);
        } else {
          console.log(`⚠️  Error but unexpected message: ${error.message}\n`);
        }
      }
    }
    
    console.log('📊 Results:');
    console.log(`   Passed: ${passed}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total:  ${passed + failed}\n`);
    
    if (failed === 0) {
      console.log('🎉 All voice compatibility tests passed!\n');
      return true;
    } else {
      console.log('⚠️  Some tests failed. Review errors above.\n');
      return false;
    }
    
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    return false;
  }
}

// Run tests
testVoiceCompatibility()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
