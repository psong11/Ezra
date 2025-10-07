#!/usr/bin/env node
/**
 * Test to see if empty string values cause issues
 */

import { TextToSpeechClient } from '@google-cloud/text-to-speech';

async function testEmptyStrings() {
  console.log('🔍 Testing with empty string values...\n');

  const client = new TextToSpeechClient();

  // Test 1: With empty voice name
  console.log('1️⃣  Testing with empty voice name string...');
  try {
    const request = {
      input: { text: 'Hello world' },
      voice: { 
        languageCode: 'en-US',
        name: '', // Empty string
      },
      audioConfig: { audioEncoding: 'MP3' as const },
    };
    console.log('Request:', JSON.stringify(request, null, 2));
    const [response] = await client.synthesizeSpeech(request);
    console.log(`✅ Success: ${response.audioContent?.length} bytes\n`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('   Code:', error.code);
    console.error('   Details:', JSON.stringify(error.details, null, 2), '\n');
  }

  // Test 2: With empty string model
  console.log('2️⃣  Testing with empty model string...');
  try {
    const request: any = {
      input: { text: 'Hello world' },
      voice: { 
        languageCode: 'en-US',
        name: 'en-US-Standard-A',
        model: '', // Empty string
      },
      audioConfig: { audioEncoding: 'MP3' },
    };
    console.log('Request:', JSON.stringify(request, null, 2));
    const [response] = await client.synthesizeSpeech(request);
    console.log(`✅ Success: ${response.audioContent?.length} bytes\n`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('   Code:', error.code);
    console.error('   Details:', JSON.stringify(error.details, null, 2), '\n');
  }

  // Test 3: With empty languageCode
  console.log('3️⃣  Testing with empty languageCode string...');
  try {
    const request = {
      input: { text: 'Hello world' },
      voice: { 
        languageCode: '', // Empty string
      },
      audioConfig: { audioEncoding: 'MP3' as const },
    };
    console.log('Request:', JSON.stringify(request, null, 2));
    const [response] = await client.synthesizeSpeech(request);
    console.log(`✅ Success: ${response.audioContent?.length} bytes\n`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('   Code:', error.code);
    console.error('   Details:', JSON.stringify(error.details, null, 2), '\n');
  }

  console.log('✅ Test complete');
}

testEmptyStrings().catch(console.error);
