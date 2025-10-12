#!/usr/bin/env node
/**
 * Add English translations to all Bible books using OpenAI
 * This script reads existing JSON files and adds translation field to each verse
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

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface BibleVerse {
  verse: number;
  text: string;
  words?: string[];
  translation?: string;
}

interface BibleChapter {
  chapter: number;
  verses: BibleVerse[];
}

interface BibleBookData {
  book: {
    id: string;
    name: string;
    nameEnglish?: string;
    nameGreek?: string;
    nameHebrew?: string;
    testament: string;
    order?: number;
    totalChapters?: number;
    totalVerses?: number;
    language?: string;
    abbreviation?: string;
  };
  chapters: BibleChapter[];
}

// Rate limiting: delay between API calls
const DELAY_MS = 500; // 500ms between calls to avoid rate limits
const BATCH_SIZE = 10; // Process 10 verses at a time

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
    const lines = translationText.split('\n').filter(line => line.trim());
    
    const translations = verses.map((v, idx) => {
      // Try to find matching verse number in response
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

      // Fallback: use line by index if verse number doesn't match
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
    console.error(`❌ Error translating verses: ${error.message}`);
    // Return empty translations on error
    return verses.map(v => ({
      verse: v.verse,
      translation: '[Translation error]'
    }));
  }
}

async function addTranslationsToBook(
  bookPath: string,
  testament: 'hebrew' | 'greek'
): Promise<void> {
  const bookData: BibleBookData = JSON.parse(fs.readFileSync(bookPath, 'utf-8'));
  const bookName = bookData.book.nameEnglish || bookData.book.name;
  
  console.log(`\n📖 Processing ${bookName}...`);
  
  let totalVerses = 0;
  let translatedVerses = 0;

  for (const chapter of bookData.chapters) {
    // Check if translations already exist
    const needsTranslation = chapter.verses.some(v => !v.translation);
    
    if (!needsTranslation) {
      console.log(`   ⏭️  Chapter ${chapter.chapter}: Already has translations`);
      totalVerses += chapter.verses.length;
      translatedVerses += chapter.verses.length;
      continue;
    }

    const versesToTranslate = chapter.verses.filter(v => !v.translation);
    totalVerses += chapter.verses.length;

    console.log(`   📝 Chapter ${chapter.chapter}: Translating ${versesToTranslate.length} verses...`);

    // Process in batches
    for (let i = 0; i < versesToTranslate.length; i += BATCH_SIZE) {
      const batch = versesToTranslate.slice(i, i + BATCH_SIZE);
      const batchTranslations = await translateVerses(
        batch,
        bookName,
        chapter.chapter,
        testament
      );

      // Apply translations to original verses
      batchTranslations.forEach(({ verse, translation }) => {
        const verseObj = chapter.verses.find(v => v.verse === verse);
        if (verseObj) {
          verseObj.translation = translation;
          translatedVerses++;
        }
      });

      // Rate limiting
      if (i + BATCH_SIZE < versesToTranslate.length) {
        await delay(DELAY_MS);
      }
    }

    console.log(`   ✅ Chapter ${chapter.chapter}: Complete (${chapter.verses.length} verses)`);
  }

  // Save updated book
  fs.writeFileSync(bookPath, JSON.stringify(bookData, null, 2));
  console.log(`✅ ${bookName}: ${translatedVerses}/${totalVerses} verses translated`);
}

async function main() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   BIBLE TRANSLATION GENERATOR                     ║');
  console.log('║   Adding English translations to all books        ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  // Check for API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ ERROR: OPENAI_API_KEY environment variable not set');
    console.error('   Please set your OpenAI API key in .env.local');
    process.exit(1);
  }

  const dataDir = path.join(__dirname, '..', 'src', 'data', 'bible');
  const hebrewDir = path.join(dataDir, 'hebrew');
  const greekDir = path.join(dataDir, 'greek');

  // Get all book files
  const hebrewBooks = fs.readdirSync(hebrewDir)
    .filter(f => f.endsWith('.json'))
    .map(f => ({ path: path.join(hebrewDir, f), testament: 'hebrew' as const }));

  const greekBooks = fs.readdirSync(greekDir)
    .filter(f => f.endsWith('.json'))
    .map(f => ({ path: path.join(greekDir, f), testament: 'greek' as const }));

  const allBooks = [...hebrewBooks, ...greekBooks];

  console.log(`📚 Found ${allBooks.length} books (${hebrewBooks.length} Hebrew, ${greekBooks.length} Greek)\n`);
  console.log('⚠️  This will take a while due to rate limiting...\n');

  // Process each book
  for (let i = 0; i < allBooks.length; i++) {
    const { path: bookPath, testament } = allBooks[i];
    await addTranslationsToBook(bookPath, testament);
    
    // Extra delay between books
    if (i < allBooks.length - 1) {
      await delay(1000);
    }
  }

  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║              TRANSLATION COMPLETE!                ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log('\n✨ All Bible books now have English translations!');
  console.log('🚀 Translations are available in the "translation" field of each verse');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
