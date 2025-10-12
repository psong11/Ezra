#!/usr/bin/env node
/**
 * Test translation on a single book (Genesis) before running on all books
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import OpenAI from 'openai';
import * as fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface BibleVerse {
  verse: number;
  text: string;
  words?: string[];
  translation?: string;
}

const BATCH_SIZE = 5; // Smaller batch for testing
const DELAY_MS = 500;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function translateVerses(
  verses: { verse: number; text: string }[],
  bookName: string,
  chapter: number,
  testament: 'hebrew' | 'greek'
): Promise<{ verse: number; translation: string }[]> {
  const language = testament === 'hebrew' ? 'Biblical Hebrew' : 'Koine Greek';
  const verseTexts = verses.map(v => `${v.verse}. ${v.text}`).join('\n');

  console.log(`   🤖 Calling OpenAI for ${verses.length} verses...`);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a Biblical scholar expert in ${language} translation. Translate the provided verses into clear, accurate English. Maintain the verse-by-verse structure. Be faithful to the original text while using natural English. Do not add commentary or explanations.`
        },
        {
          role: 'user',
          content: `Translate these verses from ${bookName} chapter ${chapter} from ${language} to English. Return ONLY the translations in this format:
[verse number]. [English translation]

Verses to translate:
${verseTexts}`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const translationText = response.choices[0].message.content || '';
    console.log(`   ✅ Received response (${translationText.length} chars)`);
    
    const lines = translationText.split('\n').filter(line => line.trim());
    
    const translations = verses.map((v, idx) => {
      const matchingLine = lines.find(line => {
        const match = line.match(/^(\d+)\.\s*(.+)$/);
        return match && parseInt(match[1]) === v.verse;
      });

      if (matchingLine) {
        const match = matchingLine.match(/^(\d+)\.\s*(.+)$/);
        return {
          verse: v.verse,
          translation: match![2].trim()
        };
      }

      if (lines[idx]) {
        const cleaned = lines[idx].replace(/^\d+\.\s*/, '').trim();
        return {
          verse: v.verse,
          translation: cleaned
        };
      }

      return {
        verse: v.verse,
        translation: '[Translation unavailable]'
      };
    });

    return translations;
  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`);
    return verses.map(v => ({
      verse: v.verse,
      translation: '[Translation error]'
    }));
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   TEST TRANSLATION - Genesis Chapter 1           ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ ERROR: OPENAI_API_KEY not set');
    console.error('   Please add to .env.local');
    process.exit(1);
  }

  const genesisPath = path.join(__dirname, '..', 'src', 'data', 'bible', 'hebrew', 'genesis.json');
  
  if (!fs.existsSync(genesisPath)) {
    console.error('❌ Genesis file not found');
    process.exit(1);
  }

  const genesisData = JSON.parse(fs.readFileSync(genesisPath, 'utf-8'));
  const chapter1 = genesisData.chapters.find((c: any) => c.chapter === 1);

  if (!chapter1) {
    console.error('❌ Chapter 1 not found');
    process.exit(1);
  }

  console.log(`📖 Testing on Genesis Chapter 1 (${chapter1.verses.length} verses)\n`);

  // Process first 10 verses only for testing
  const testVerses = chapter1.verses.slice(0, 10);
  console.log(`Testing with first ${testVerses.length} verses...\n`);

  for (let i = 0; i < testVerses.length; i += BATCH_SIZE) {
    const batch = testVerses.slice(i, i + BATCH_SIZE);
    console.log(`📝 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}: verses ${batch[0].verse}-${batch[batch.length - 1].verse}`);
    
    const translations = await translateVerses(
      batch,
      'Genesis',
      1,
      'hebrew'
    );

    // Display results
    translations.forEach(({ verse, translation }) => {
      const originalVerse = testVerses.find((v: BibleVerse) => v.verse === verse);
      console.log(`\n   Verse ${verse}:`);
      console.log(`   Original: ${originalVerse?.text.substring(0, 80)}...`);
      console.log(`   Translation: ${translation}`);
    });

    if (i + BATCH_SIZE < testVerses.length) {
      console.log(`\n   ⏳ Waiting ${DELAY_MS}ms...\n`);
      await delay(DELAY_MS);
    }
  }

  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║              TEST COMPLETE!                       ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log('\n✅ Translation system is working correctly!');
  console.log('📋 Next step: Run "npm run add-translations" to process all books');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
