#!/usr/bin/env node
/**
 * Debug script to see exactly what parameters are being sent to Google TTS
 */

import { TextToSpeechClient } from '@google-cloud/text-to-speech';

async function debugTTSRequest() {
  console.log('🔍 Debugging Google TTS Request Parameters...\n');

  const client = new TextToSpeechClient();

  // Test 1: Minimal request
  console.log('1️⃣  Testing minimal request...');
  const minimalRequest = {
    input: { text: 'Hello world' },
    voice: { languageCode: 'en-US' },
    audioConfig: { audioEncoding: 'MP3' as const },
  };
  console.log('Request:', JSON.stringify(minimalRequest, null, 2));
  
  try {
    const [response] = await client.synthesizeSpeech(minimalRequest);
    console.log(`✅ Success: ${response.audioContent?.length} bytes\n`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('   Code:', error.code);
    console.error('   Details:', error.details, '\n');
  }

  // Test 2: With voice name
  console.log('2️⃣  Testing with voice name...');
  const voiceRequest = {
    input: { text: 'Hello world' },
    voice: { 
      languageCode: 'en-US',
      name: 'en-US-Standard-A'
    },
    audioConfig: { audioEncoding: 'MP3' as const },
  };
  console.log('Request:', JSON.stringify(voiceRequest, null, 2));
  
  try {
    const [response] = await client.synthesizeSpeech(voiceRequest);
    console.log(`✅ Success: ${response.audioContent?.length} bytes\n`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('   Code:', error.code);
    console.error('   Details:', error.details, '\n');
  }

  // Test 3: With audio parameters
  console.log('3️⃣  Testing with audio parameters...');
  const audioParamsRequest = {
    input: { text: 'Hello world' },
    voice: { 
      languageCode: 'en-US',
      name: 'en-US-Standard-A'
    },
    audioConfig: { 
      audioEncoding: 'MP3' as const,
      speakingRate: 1.2,
      pitch: 2.0,
      volumeGainDb: 5.0,
    },
  };
  console.log('Request:', JSON.stringify(audioParamsRequest, null, 2));
  
  try {
    const [response] = await client.synthesizeSpeech(audioParamsRequest);
    console.log(`✅ Success: ${response.audioContent?.length} bytes\n`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('   Code:', error.code);
    console.error('   Details:', error.details, '\n');
  }

  // Test 4: With undefined model (potential issue)
  console.log('4️⃣  Testing with undefined model field...');
  const undefinedModelRequest = {
    input: { text: 'Hello world' },
    voice: { 
      languageCode: 'en-US',
      name: 'en-US-Standard-A',
      model: undefined, // This might cause issues
    },
    audioConfig: { audioEncoding: 'MP3' as const },
  };
  console.log('Request:', JSON.stringify(undefinedModelRequest, null, 2));
  
  try {
    const [response] = await client.synthesizeSpeech(undefinedModelRequest);
    console.log(`✅ Success: ${response.audioContent?.length} bytes\n`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('   Code:', error.code);
    console.error('   Details:', error.details, '\n');
  }

  // Test 5: With null values (potential issue)
  console.log('5️⃣  Testing with null values...');
  const nullValuesRequest: any = {
    input: { text: 'Hello world' },
    voice: { 
      languageCode: 'en-US',
      name: 'en-US-Standard-A',
      model: null, // This might cause issues
    },
    audioConfig: { audioEncoding: 'MP3' },
  };
  console.log('Request:', JSON.stringify(nullValuesRequest, null, 2));
  
  try {
    const [response] = await client.synthesizeSpeech(nullValuesRequest);
    console.log(`✅ Success: ${response.audioContent?.length} bytes\n`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('   Code:', error.code);
    console.error('   Details:', error.details, '\n');
  }

  console.log('✅ Debug complete');
}

debugTTSRequest().catch(console.error);
