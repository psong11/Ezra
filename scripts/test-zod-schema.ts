#!/usr/bin/env node
/**
 * Test Zod schema with empty strings
 */

import { z } from 'zod';

const TTSRequestSchema = z.object({
  text: z.string().optional(),
  ssml: z.string().optional(),
  voiceName: z.string().optional(),
  languageCode: z.string().default('en-US'),
  audioEncoding: z.enum(['MP3', 'OGG_OPUS', 'LINEAR16']).default('MP3'),
  speakingRate: z.number().min(0.25).max(4.0).default(1.0),
  pitch: z.number().min(-20.0).max(20.0).default(0.0),
  volumeGainDb: z.number().min(-96.0).max(16.0).default(0.0),
  model: z.string().optional(),
}).refine(
  (data: { text?: string; ssml?: string }): boolean => !!(data.text || data.ssml),
  { message: 'Either text or ssml must be provided' }
);

console.log('🧪 Testing Zod schema with various inputs...\n');

// Test 1: No languageCode
console.log('1️⃣  No languageCode:');
const result1 = TTSRequestSchema.parse({ text: 'Hello' });
console.log('   languageCode:', JSON.stringify(result1.languageCode));
console.log('   Is empty?', result1.languageCode === '');
console.log();

// Test 2: undefined languageCode
console.log('2️⃣  undefined languageCode:');
const result2 = TTSRequestSchema.parse({ text: 'Hello', languageCode: undefined });
console.log('   languageCode:', JSON.stringify(result2.languageCode));
console.log('   Is empty?', result2.languageCode === '');
console.log();

// Test 3: Empty string languageCode
console.log('3️⃣  Empty string languageCode:');
const result3 = TTSRequestSchema.parse({ text: 'Hello', languageCode: '' });
console.log('   languageCode:', JSON.stringify(result3.languageCode));
console.log('   Is empty?', result3.languageCode === '');
console.log('   ⚠️  THIS IS THE PROBLEM!');
console.log();

// Test 4: null languageCode
console.log('4️⃣  null languageCode:');
try {
  const result4 = TTSRequestSchema.parse({ text: 'Hello', languageCode: null });
  console.log('   languageCode:', JSON.stringify(result4.languageCode));
  console.log('   Is empty?', result4.languageCode === '');
} catch (error: any) {
  console.log('   ❌ Error:', error.errors[0].message);
}
console.log();

console.log('✅ Tests complete\n');
console.log('💡 Solution: Use .transform() or .refine() to convert empty strings to undefined, or use a stricter validation.');
