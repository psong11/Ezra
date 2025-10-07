#!/usr/bin/env node
/**
 * Test to see if undefined values cause issues
 */

import { getGoogleTTSClient } from '../src/lib/tts/google';

async function testUndefinedValues() {
  console.log('🔍 Testing with undefined values in synthesize params...\n');

  const client = getGoogleTTSClient();

  // Test 1: With explicit undefined values
  console.log('1️⃣  Testing with explicit undefined values...');
  try {
    const result = await client.synthesize({
      text: 'Hello world',
      voiceName: undefined,
      languageCode: 'en-US',
      audioEncoding: 'MP3',
      speakingRate: 1.0,
      pitch: 0.0,
      volumeGainDb: 0.0,
      model: undefined,
    });
    console.log(`✅ Success: ${result.length} bytes\n`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('   Code:', error.code);
    console.error('   Details:', error.details, '\n');
  }

  // Test 2: Without optional fields
  console.log('2️⃣  Testing without optional fields...');
  try {
    const result = await client.synthesize({
      text: 'Hello world',
      languageCode: 'en-US',
      audioEncoding: 'MP3',
      speakingRate: 1.0,
      pitch: 0.0,
      volumeGainDb: 0.0,
    });
    console.log(`✅ Success: ${result.length} bytes\n`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('   Code:', error.code);
    console.error('   Details:', error.details, '\n');
  }

  console.log('✅ Test complete');
}

testUndefinedValues().catch(console.error);
