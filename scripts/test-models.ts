/**
 * Test different model values for Journey voices
 * 
 * ⚠️  DEPRECATED: This is an exploratory script.
 * Journey voices are not currently supported.
 * Use test-google-tts.ts for production testing.
 */

// @ts-nocheck
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

async function testModels() {
  console.log('🧪 Testing different model values for Journey voices...\n');

  const client = new TextToSpeechClient();
  const text = 'Hello, this is a test.';
  const voiceName = 'Achernar';
  const languageCode = 'en-US';
  
  const modelsToTry = [
    'journey',
    'Journey',
    'JOURNEY',
    'journey-d',
    'journey-f',
    'journey-o',
    'journey-od',
    'en-us-journey-d',
    'en-us-journey-f',
    'en-us-journey-o',
    'projects/project-id/locations/global/models/journey',
  ];
  
  for (const model of modelsToTry) {
    try {
      console.log(`Testing model: "${model}"...`);
      
      const [response] = await client.synthesizeSpeech({
        input: { text },
        voice: {
          languageCode,
          name: voiceName,
          // @ts-ignore - Testing non-standard model parameter
          model,
        },
        audioConfig: {
          audioEncoding: 'MP3' as any,
        },
      });
      
      if (response.audioContent && response.audioContent.length > 0) {
        console.log(`✅ SUCCESS with model: "${model}" (${response.audioContent.length} bytes)\n`);
        break;
      }
    } catch (error: any) {
      console.log(`❌ Failed: ${error.message}\n`);
    }
  }
}

testModels().catch(console.error);
