#!/usr/bin/env node
/**
 * Add word-by-word English translations to Bible verses
 * Each Hebrew/Greek word gets its own English translation
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

interface WordTranslation {
  word: string;
  translation: string;
  transliteration?: string;
}

interface BibleVerse {
  verse: number;
  text: string;
  words?: string[];
  translation?: string;
  wordTranslations?: WordTranslation[];
}

const DELAY_MS = 1000; // Longer delay for word-by-word (more complex)
const VERSES_PER_BATCH = 3; // Smaller batches for detailed translations

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getWordTranslations(
  verse: BibleVerse,
  bookName: string,
  chapter: number,
  verseNum: number,
  testament: 'hebrew' | 'greek'
): Promise<WordTranslation[]> {
  const language = testament === 'hebrew' ? 'Biblical Hebrew' : 'Koine Greek';
  const words = verse.text.split(/\s+/);

  console.log(`   🔤 Getting word translations for verse ${verseNum} (${words.length} words)...`);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a Biblical scholar expert in ${language}. Provide word-by-word translations of Bible verses. For each word, give its English meaning in context. Be concise and accurate.`
        },
        {
          role: 'user',
          content: `Translate each word from ${bookName} ${chapter}:${verseNum} individually.

Original text: ${verse.text}

Provide translations in this exact format, one per line:
[original word] -> [English translation]

Example format:
בְּרֵאשִׁית -> In-the-beginning
בָּרָא -> created
אֱלֹהִים -> God

Now translate all words:`
        }
      ],
      temperature: 0.2,
      max_tokens: 1000
    });

    const responseText = response.choices[0].message.content || '';
    const lines = responseText.split('\n').filter(line => line.includes('->'));

    const wordTranslations: WordTranslation[] = [];

    lines.forEach((line, idx) => {
      const parts = line.split('->').map(p => p.trim());
      if (parts.length >= 2) {
        wordTranslations.push({
          word: parts[0],
          translation: parts[1]
        });
      }
    });

    // If we got fewer translations than words, pad with the remaining words
    while (wordTranslations.length < words.length) {
      wordTranslations.push({
        word: words[wordTranslations.length],
        translation: '[?]'
      });
    }

    console.log(`   ✅ Got ${wordTranslations.length} word translations`);
    return wordTranslations;

  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`);
    // Return basic structure on error
    return words.map(word => ({
      word,
      translation: '[?]'
    }));
  }
}

async function addWordTranslationsToBook(
  bookPath: string,
  testament: 'hebrew' | 'greek'
): Promise<void> {
  const bookData = JSON.parse(fs.readFileSync(bookPath, 'utf-8'));
  const bookName = bookData.book.nameEnglish || bookData.book.name;
  
  console.log(`\n📖 Processing ${bookName}...`);
  
  let totalVerses = 0;
  let translatedVerses = 0;

  // Only process first chapter for testing
  const chaptersToProcess = bookData.chapters.slice(0, 1);

  for (const chapter of chaptersToProcess) {
    console.log(`\n   📝 Chapter ${chapter.chapter}:`);

    // Only process first 5 verses for testing
    const versesToProcess = chapter.verses.slice(0, 5);

    for (const verse of versesToProcess) {
      totalVerses++;

      // Skip if already has word translations
      if (verse.wordTranslations && verse.wordTranslations.length > 0) {
        console.log(`   ⏭️  Verse ${verse.verse}: Already has word translations`);
        translatedVerses++;
        continue;
      }

      const wordTranslations = await getWordTranslations(
        verse,
        bookName,
        chapter.chapter,
        verse.verse,
        testament
      );

      verse.wordTranslations = wordTranslations;
      translatedVerses++;

      // Rate limiting
      await delay(DELAY_MS);
    }
  }

  // Save updated book
  fs.writeFileSync(bookPath, JSON.stringify(bookData, null, 2));
  console.log(`\n✅ ${bookName}: ${translatedVerses}/${totalVerses} verses with word translations`);
}

async function main() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   WORD-BY-WORD TRANSLATION TEST                   ║');
  console.log('║   Testing on Genesis Chapter 1 (first 5 verses)  ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ ERROR: OPENAI_API_KEY not set');
    process.exit(1);
  }

  const genesisPath = path.join(__dirname, '..', 'src', 'data', 'bible', 'hebrew', 'genesis.json');

  await addWordTranslationsToBook(genesisPath, 'hebrew');

  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║              TEST COMPLETE!                       ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log('\n✨ Check genesis.json for wordTranslations field');
  console.log('📋 Review quality before running on all books');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
