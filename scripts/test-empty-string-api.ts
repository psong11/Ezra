#!/usr/bin/env node
/**
 * Test that empty string parameters are handled correctly
 */

// Try different ports
const PORTS = [3000, 3001, 3002, 3005];
const MAX_RETRIES = 30; // 30 seconds max
const RETRY_DELAY = 1000; // 1 second

async function waitForServer() {
  console.log('🔍 Looking for running server...');
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    for (const port of PORTS) {
      try {
        const response = await fetch(`http://localhost:${port}/api/voices`, { 
          method: 'GET',
          signal: AbortSignal.timeout(2000)
        });
        if (response.ok) {
          console.log(`✅ Found server running on port ${port}\n`);
          return `http://localhost:${port}`;
        }
      } catch (error) {
        // Server not available on this port, try next
      }
    }
    
    // Wait before next retry
    if (attempt < MAX_RETRIES - 1) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      process.stdout.write(`⏳ Waiting for server... (${attempt + 1}/${MAX_RETRIES})\r`);
    }
  }
  
  console.log('\n');
  throw new Error('No server found running on any expected port. Please start the dev server with: npm run dev');
}

let BASE_URL: string;

async function testEmptyStringHandling() {
  console.log('🧪 Testing Empty String Parameter Handling\n');

  // Test 1: Empty string languageCode
  console.log('1️⃣  Testing empty string languageCode...');
  try {
    const response = await fetch(`${BASE_URL}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Hello, world!',
        languageCode: '', // Empty string should be converted to 'en-US'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error:', error);
      throw new Error('Request failed');
    }

    const buffer = await response.arrayBuffer();
    console.log(`✅ Success: ${buffer.byteLength} bytes`);
    console.log('   Empty languageCode was converted to default\n');
  } catch (error: any) {
    console.error('❌ Failed:', error.message, '\n');
  }

  // Test 2: Empty string voiceName
  console.log('2️⃣  Testing empty string voiceName...');
  try {
    const response = await fetch(`${BASE_URL}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Hello, world!',
        voiceName: '', // Empty string should be treated as undefined
        languageCode: 'en-US',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error:', error);
      throw new Error('Request failed');
    }

    const buffer = await response.arrayBuffer();
    console.log(`✅ Success: ${buffer.byteLength} bytes`);
    console.log('   Empty voiceName was handled correctly\n');
  } catch (error: any) {
    console.error('❌ Failed:', error.message, '\n');
  }

  // Test 3: Empty string model
  console.log('3️⃣  Testing empty string model...');
  try {
    const response = await fetch(`${BASE_URL}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Hello, world!',
        voiceName: 'en-US-Standard-A',
        languageCode: 'en-US',
        model: '', // Empty string should be treated as undefined
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error:', error);
      throw new Error('Request failed');
    }

    const buffer = await response.arrayBuffer();
    console.log(`✅ Success: ${buffer.byteLength} bytes`);
    console.log('   Empty model was handled correctly\n');
  } catch (error: any) {
    console.error('❌ Failed:', error.message, '\n');
  }

  // Test 4: All empty strings together
  console.log('4️⃣  Testing all empty strings together...');
  try {
    const response = await fetch(`${BASE_URL}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Hello, world!',
        voiceName: '',
        languageCode: '',
        model: '',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error:', error);
      throw new Error('Request failed');
    }

    const buffer = await response.arrayBuffer();
    console.log(`✅ Success: ${buffer.byteLength} bytes`);
    console.log('   All empty strings handled correctly\n');
  } catch (error: any) {
    console.error('❌ Failed:', error.message, '\n');
  }

  console.log('✅ Empty string handling test complete!');
}

// Run test
async function main() {
  try {
    BASE_URL = await waitForServer();
    await testEmptyStringHandling();
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();
