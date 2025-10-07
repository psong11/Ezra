#!/usr/bin/env node
/**
 * Test script to call the TTS API and check for errors
 */

async function testTTSAPI() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('🧪 Testing TTS API...\n');

  // Test 1: Basic text
  console.log('1️⃣  Testing basic text...');
  try {
    const response = await fetch(`${baseUrl}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Hello, this is a test.',
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error:', error);
    } else {
      const buffer = await response.arrayBuffer();
      console.log(`✅ Success: ${buffer.byteLength} bytes`);
      console.log(`   Cache hit: ${response.headers.get('X-Cache-Hit')}`);
    }
  } catch (error: any) {
    console.error('❌ Request failed:', error.message);
  }

  // Test 2: With specific voice
  console.log('\n2️⃣  Testing with specific voice...');
  try {
    const response = await fetch(`${baseUrl}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Testing with a specific voice.',
        voiceName: 'en-US-Standard-A',
        languageCode: 'en-US',
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error:', error);
    } else {
      const buffer = await response.arrayBuffer();
      console.log(`✅ Success: ${buffer.byteLength} bytes`);
    }
  } catch (error: any) {
    console.error('❌ Request failed:', error.message);
  }

  // Test 3: Invalid request (should trigger validation error)
  console.log('\n3️⃣  Testing invalid request (no text)...');
  try {
    const response = await fetch(`${baseUrl}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.log('✅ Correctly rejected:', error.error);
    } else {
      console.error('❌ Should have failed but succeeded');
    }
  } catch (error: any) {
    console.error('❌ Request failed:', error.message);
  }

  // Test 4: With audio parameters
  console.log('\n4️⃣  Testing with custom audio parameters...');
  try {
    const response = await fetch(`${baseUrl}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Testing with custom parameters.',
        voiceName: 'en-US-Standard-B',
        languageCode: 'en-US',
        speakingRate: 1.2,
        pitch: 2.0,
        volumeGainDb: 5.0,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error:', error);
    } else {
      const buffer = await response.arrayBuffer();
      console.log(`✅ Success: ${buffer.byteLength} bytes`);
    }
  } catch (error: any) {
    console.error('❌ Request failed:', error.message);
  }

  console.log('\n✅ API test complete');
}

testTTSAPI().catch(console.error);
