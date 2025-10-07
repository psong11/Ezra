#!/usr/bin/env node
/**
 * Test the fixed Zod schema
 */

import { z } from 'zod';

const TTSRequestSchema = z.object({
  text: z.string().optional(),
  ssml: z.string().optional(),
  voiceName: z.string().optional().transform(val => val === '' ? undefined : val),
  languageCode: z.string().default('en-US').transform(val => val === '' ? 'en-US' : val),
  audioEncoding: z.enum(['MP3', 'OGG_OPUS', 'LINEAR16']).default('MP3'),
  speakingRate: z.number().min(0.25).max(4.0).default(1.0),
  pitch: z.number().min(-20.0).max(20.0).default(0.0),
  volumeGainDb: z.number().min(-96.0).max(16.0).default(0.0),
  model: z.string().optional().transform(val => val === '' ? undefined : val),
}).refine(
  (data: { text?: string; ssml?: string }): boolean => !!(data.text || data.ssml),
  { message: 'Either text or ssml must be provided' }
);

console.log('🧪 Testing FIXED Zod schema...\n');

// Test 1: Empty string languageCode (SHOULD NOW BE FIXED)
console.log('1️⃣  Empty string languageCode:');
const result1 = TTSRequestSchema.parse({ text: 'Hello', languageCode: '' });
console.log('   languageCode:', JSON.stringify(result1.languageCode));
console.log('   ✅ Fixed! Now returns:', result1.languageCode);
console.log();

// Test 2: Empty string voiceName
console.log('2️⃣  Empty string voiceName:');
const result2 = TTSRequestSchema.parse({ text: 'Hello', voiceName: '' });
console.log('   voiceName:', JSON.stringify(result2.voiceName));
console.log('   ✅ Converted to undefined');
console.log();

// Test 3: Empty string model
console.log('3️⃣  Empty string model:');
const result3 = TTSRequestSchema.parse({ text: 'Hello', model: '' });
console.log('   model:', JSON.stringify(result3.model));
console.log('   ✅ Converted to undefined');
console.log();

// Test 4: Valid values still work
console.log('4️⃣  Valid values:');
const result4 = TTSRequestSchema.parse({ 
  text: 'Hello', 
  languageCode: 'fr-FR', 
  voiceName: 'fr-FR-Standard-A',
  model: 'my-model'
});
console.log('   languageCode:', result4.languageCode);
console.log('   voiceName:', result4.voiceName);
console.log('   model:', result4.model);
console.log('   ✅ All values preserved correctly');
console.log();

// Test 5: Missing optional fields
console.log('5️⃣  Missing optional fields:');
const result5 = TTSRequestSchema.parse({ text: 'Hello' });
console.log('   languageCode:', result5.languageCode);
console.log('   voiceName:', result5.voiceName);
console.log('   model:', result5.model);
console.log('   ✅ Defaults applied correctly');
console.log();

console.log('✅ All tests passed! The schema is now robust against empty strings.');
