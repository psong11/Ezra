#!/usr/bin/env node
/**
 * Test TTS with various poem language codes
 */

const PORTS = [3000, 3001, 3002, 3005];
const MAX_RETRIES = 20;
const RETRY_DELAY = 1000;

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
    
    if (attempt < MAX_RETRIES - 1) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      process.stdout.write(`⏳ Waiting for server... (${attempt + 1}/${MAX_RETRIES})\r`);
    }
  }
  
  console.log('\n');
  throw new Error('No server found. Please start with: npm run dev');
}

async function testLanguageCode(baseUrl: string, langCode: string, testName: string) {
  console.log(`Testing ${testName} (${langCode})...`);
  
  try {
    const response = await fetch(`${baseUrl}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Hello, this is a test.',
        languageCode: langCode,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`  ❌ Error:`, error);
      return false;
    }

    const buffer = await response.arrayBuffer();
    console.log(`  ✅ Success: ${buffer.byteLength} bytes\n`);
    return true;
  } catch (error: any) {
    console.error(`  ❌ Failed:`, error.message, '\n');
    return false;
  }
}

async function main() {
  try {
    const BASE_URL = await waitForServer();
    
    console.log('🧪 Testing Various Language Codes\n');

    const tests = [
      ['en-US', 'US English'],
      ['en-AU', 'Australian English'],
      ['ar-SA', 'Arabic'],
      ['zh-CN', 'Chinese'],
      ['fr-FR', 'French'],
      ['de-DE', 'German'],
      ['ja-JP', 'Japanese'],
      ['es-ES', 'Spanish'],
    ];

    let passed = 0;
    let failed = 0;

    for (const [code, name] of tests) {
      const result = await testLanguageCode(BASE_URL, code, name);
      if (result) passed++;
      else failed++;
    }

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
    
    if (failed > 0) {
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();
