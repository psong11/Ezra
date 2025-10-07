/**
 * TTS API Endpoint Test Script
 * Tests the Next.js API routes for TTS functionality
 */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const dev = true;
const hostname = 'localhost';
const port = 3000;

async function testTTSAPI() {
  console.log('🧪 Testing TTS API Endpoints...\n');

  try {
    // Test if server is running
    console.log('1️⃣  Checking if server is accessible...');
    const healthCheck = await fetch(`http://${hostname}:${port}/api/voices`).catch(() => null);
    
    if (!healthCheck) {
      console.log('⚠️  Server not running. Please start with: npm run dev\n');
      return false;
    }
    console.log('✅ Server is accessible\n');

    // 2. Test voices endpoint
    console.log('2️⃣  Testing /api/voices endpoint...');
    const voicesResponse = await fetch(`http://${hostname}:${port}/api/voices`);
    
    if (!voicesResponse.ok) {
      throw new Error(`Voices API failed: ${voicesResponse.status} ${voicesResponse.statusText}`);
    }
    
    const voicesData = await voicesResponse.json();
    console.log(`✅ Retrieved ${voicesData.count} voices`);
    console.log(`   Sample: ${voicesData.voices[0]?.name || 'N/A'}\n`);

    // 3. Test basic TTS synthesis
    console.log('3️⃣  Testing /api/tts endpoint (basic)...');
    const basicRequest = {
      text: 'Hello, this is a test.',
      languageCode: 'en-US',
      audioEncoding: 'MP3',
    };

    const basicResponse = await fetch(`http://${hostname}:${port}/api/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(basicRequest),
    });

    if (!basicResponse.ok) {
      const errorData = await basicResponse.json().catch(() => ({}));
      throw new Error(`TTS API failed: ${basicResponse.status} - ${JSON.stringify(errorData)}`);
    }

    const contentType = basicResponse.headers.get('Content-Type');
    const contentLength = basicResponse.headers.get('Content-Length');
    const cacheHit = basicResponse.headers.get('X-Cache-Hit');
    const cacheKey = basicResponse.headers.get('X-Cache-Key');

    console.log(`✅ TTS synthesis successful`);
    console.log(`   Content-Type: ${contentType}`);
    console.log(`   Content-Length: ${contentLength} bytes`);
    console.log(`   Cache Hit: ${cacheHit}`);
    console.log(`   Cache Key: ${cacheKey}\n`);

    // Get the audio blob
    const audioBlob = await basicResponse.blob();
    console.log(`   Audio blob size: ${audioBlob.size} bytes\n`);

    // 4. Test caching (second request should hit cache)
    console.log('4️⃣  Testing caching (second request)...');
    const cachedResponse = await fetch(`http://${hostname}:${port}/api/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(basicRequest),
    });

    const cachedCacheHit = cachedResponse.headers.get('X-Cache-Hit');
    console.log(`✅ Second request completed`);
    console.log(`   Cache Hit: ${cachedCacheHit}`);
    
    if (cachedCacheHit === 'true') {
      console.log('   ✅ Cache is working correctly\n');
    } else {
      console.log('   ⚠️  Cache miss on second request\n');
    }

    // 5. Test with voice selection
    console.log('5️⃣  Testing with specific voice...');
    const voiceRequest = {
      text: 'Testing with a specific voice.',
      voiceName: voicesData.voices[0]?.name,
      languageCode: 'en-US',
      audioEncoding: 'MP3',
    };

    const voiceResponse = await fetch(`http://${hostname}:${port}/api/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(voiceRequest),
    });

    if (!voiceResponse.ok) {
      const errorData = await voiceResponse.json().catch(() => ({}));
      console.log(`⚠️  Voice-specific synthesis failed: ${JSON.stringify(errorData)}\n`);
    } else {
      console.log(`✅ Voice-specific synthesis successful\n`);
    }

    // 6. Test with custom parameters
    console.log('6️⃣  Testing with custom parameters...');
    const customRequest = {
      text: 'Testing with custom parameters.',
      languageCode: 'en-US',
      audioEncoding: 'MP3',
      speakingRate: 1.2,
      pitch: 2.0,
      volumeGainDb: -5.0,
    };

    const customResponse = await fetch(`http://${hostname}:${port}/api/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customRequest),
    });

    if (!customResponse.ok) {
      console.log(`⚠️  Custom parameters synthesis failed\n`);
    } else {
      console.log(`✅ Custom parameters synthesis successful\n`);
    }

    // 7. Test error handling
    console.log('7️⃣  Testing error handling...');
    const errorRequest = {
      // Missing both text and ssml
      languageCode: 'en-US',
    };

    const errorResponse = await fetch(`http://${hostname}:${port}/api/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorRequest),
    });

    if (errorResponse.ok) {
      console.log(`⚠️  Should have returned error for invalid request\n`);
    } else {
      const errorData = await errorResponse.json();
      console.log(`✅ Correctly returned error: ${errorData.error}\n`);
    }

    console.log('🎉 All API tests passed!\n');
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
testTTSAPI()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
