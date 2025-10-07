/**
 * Voice inspection script to understand the voice structure
 */

import { TextToSpeechClient } from '@google-cloud/text-to-speech';

async function inspectVoices() {
  console.log('🔍 Inspecting Google TTS Voices...\n');

  const client = new TextToSpeechClient();
  
  try {
    const [response] = await client.listVoices({});
    const voices = response.voices || [];
    
    console.log(`Total voices: ${voices.length}\n`);
    
    // Find Journey voices (ones that start with capital letter)
    const journeyVoices = voices.filter(v => 
      v.name && /^[A-Z][a-z]+$/.test(v.name)
    ).slice(0, 10);
    
    console.log('Sample Journey voices (require model):');
    journeyVoices.forEach(v => {
      console.log('\n---');
      console.log('Name:', v.name);
      console.log('Language:', v.languageCodes);
      console.log('Gender:', v.ssmlGender);
      console.log('Sample rate:', v.naturalSampleRateHertz);
      console.log('Full object:', JSON.stringify(v, null, 2));
    });
    
    // Find standard voices
    const standardVoices = voices.filter(v => 
      v.name && v.name.includes('-')
    ).slice(0, 5);
    
    console.log('\n\nSample standard voices:');
    standardVoices.forEach(v => {
      console.log('\n---');
      console.log('Name:', v.name);
      console.log('Language:', v.languageCodes);
      console.log('Gender:', v.ssmlGender);
      console.log('Full object:', JSON.stringify(v, null, 2));
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

inspectVoices();
