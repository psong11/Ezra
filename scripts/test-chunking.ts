#!/usr/bin/env node
/**
 * Test the chunking functionality with Genesis Chapter 1
 */

import { chunkText } from '../src/lib/tts/chunking.js';

function removeCantillationMarks(text: string): string {
  const cantillationPattern = /[\u0591-\u05AF\u05BD\u05BF]/g;
  return text.replace(cantillationPattern, '');
}

function getByteLength(text: string): number {
  return Buffer.byteLength(text, 'utf8');
}

// Sample Genesis 1 (first few verses)
const verses = [
  'בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ׃',
  'וְהָאָ֗רֶץ הָיְתָ֥ה תֹ֙הוּ֙ וָבֹ֔הוּ וְחֹ֖שֶׁךְ עַל־ פְּנֵ֣י תְה֑וֹם וְר֣וּחַ אֱלֹהִ֔ים מְרַחֶ֖פֶת עַל־ פְּנֵ֥י הַמָּֽיִם׃',
  'וַיֹּ֥אמֶר אֱלֹהִ֖ים יְהִ֣י א֑וֹר וַֽיְהִי־אֽוֹר׃',
];

// Simulate full chapter by repeating verses (Genesis 1 has 31 verses)
const fullChapter = Array(10).fill(verses.join(' ')).join(' ');

console.log('🧪 Testing Chunking with Hebrew Text\n');

const original = fullChapter;
const cleaned = removeCantillationMarks(original);

console.log('Original text:');
console.log('  Characters:', original.length);
console.log('  Bytes:', getByteLength(original), '\n');

console.log('Cleaned text (no cantillation):');
console.log('  Characters:', cleaned.length);
console.log('  Bytes:', getByteLength(cleaned), '\n');

console.log('Chunking cleaned text...\n');
const chunks = chunkText(cleaned);

console.log(`\n📊 Result: ${chunks.length} chunks created`);
chunks.forEach((chunk, i) => {
  console.log(`\nChunk ${i + 1}:`);
  console.log(`  Characters: ${chunk.length}`);
  console.log(`  Bytes: ${getByteLength(chunk)}`);
  console.log(`  First 80 chars: ${chunk.substring(0, 80)}...`);
});

console.log('\n✨ Chunking test complete!');
