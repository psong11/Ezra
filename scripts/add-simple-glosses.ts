#!/usr/bin/env node
/**
 * Add simple word glosses using a basic Hebrew-English dictionary
 * Much faster and cheaper than AI translation for every word
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface WordTranslation {
  word: string;
  translation: string;
}

// Basic Hebrew word glossary (most common words)
// This is a simplified version - a full lexicon would have thousands of entries
const HEBREW_GLOSSARY: Record<string, string> = {
  // Common verbs
  'בָּרָא': 'created',
  'עָשָׂה': 'made',
  'אָמַר': 'said',
  'וַיֹּאמֶר': 'and-said',
  'הָיָה': 'was/became',
  'רָאָה': 'saw',
  'וַיַּרְא': 'and-saw',
  'נָתַן': 'gave',
  'בּוֹא': 'came',
  'יָצָא': 'went-out',
  'לָקַח': 'took',
  
  // God/divine
  'אֱלֹהִים': 'God',
  'יְהוָה': 'LORD',
  'אֲדֹנָי': 'Lord',
  
  // Creation terms
  'בְּרֵאשִׁית': 'in-beginning',
  'שָׁמַיִם': 'heavens',
  'הַשָּׁמַיִם': 'the-heavens',
  'אֶרֶץ': 'earth',
  'הָאָרֶץ': 'the-earth',
  'אוֹר': 'light',
  'חֹשֶׁךְ': 'darkness',
  'יוֹם': 'day',
  'לַיְלָה': 'night',
  'מַיִם': 'water',
  'הַמַּיִם': 'the-water',
  
  // Prepositions and particles
  'בְּ': 'in',
  'לְ': 'to/for',
  'מִן': 'from',
  'עַל': 'on/upon',
  'אֶל': 'to',
  'אֵת': '(obj)',
  'וְ': 'and',
  'כִּי': 'that/because',
  'אֲשֶׁר': 'which/that',
  
  // Common adjectives
  'טוֹב': 'good',
  'רַע': 'evil/bad',
  'גָּדוֹל': 'great',
  'קָטָן': 'small',
};

// Greek glossary for New Testament
const GREEK_GLOSSARY: Record<string, string> = {
  'ἐν': 'in',
  'καί': 'and',
  'ὁ': 'the',
  'θεός': 'God',
  'Χριστός': 'Christ',
  'κύριος': 'Lord',
  'λόγος': 'word',
  'ἀγάπη': 'love',
};

function getSimpleGloss(word: string, testament: 'hebrew' | 'greek'): string {
  const glossary = testament === 'hebrew' ? HEBREW_GLOSSARY : GREEK_GLOSSARY;
  
  // Remove cantillation marks and vowel points for Hebrew
  const cleanWord = word.replace(/[\u0591-\u05C7]/g, '');
  
  // Check exact match
  if (glossary[cleanWord]) {
    return glossary[cleanWord];
  }
  
  // Check original word
  if (glossary[word]) {
    return glossary[word];
  }
  
  // Return empty string if not found - will not display translation
  return '';
}

function addSimpleGlossesToBook(bookPath: string, testament: 'hebrew' | 'greek'): void {
  const bookData = JSON.parse(fs.readFileSync(bookPath, 'utf-8'));
  const bookName = bookData.book.nameEnglish || bookData.book.name;
  
  console.log(`📖 Processing ${bookName}...`);
  
  let totalWords = 0;
  let glossedWords = 0;

  for (const chapter of bookData.chapters) {
    for (const verse of chapter.verses) {
      const words = verse.text.split(/\s+/);
      const wordTranslations: WordTranslation[] = [];

      words.forEach((word: string) => {
        totalWords++;
        const translation = getSimpleGloss(word, testament);
        
        if (translation) {
          glossedWords++;
          wordTranslations.push({ word, translation });
        } else {
          wordTranslations.push({ word, translation: '' });
        }
      });

      verse.wordTranslations = wordTranslations;
    }
  }

  fs.writeFileSync(bookPath, JSON.stringify(bookData, null, 2));
  console.log(`✅ ${bookName}: ${glossedWords}/${totalWords} words glossed (${Math.round(glossedWords/totalWords*100)}%)`);
}

async function main() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   FAST WORD GLOSSES (Dictionary-based)           ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  const dataDir = path.join(__dirname, '..', 'src', 'data', 'bible');
  const genesisPath = path.join(dataDir, 'hebrew', 'genesis.json');

  console.log('Adding simple glosses to Genesis...\n');
  addSimpleGlossesToBook(genesisPath, 'hebrew');

  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║              COMPLETE!                            ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log('\n✨ Fast dictionary-based glosses added!');
  console.log('📋 Only common words are translated');
  console.log('💡 Can expand glossary as needed');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
