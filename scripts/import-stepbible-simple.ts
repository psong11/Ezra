import fs from 'fs';
import path from 'path';
import https from 'https';

/**
 * Simple STEPBible import script
 * Downloads tab-separated data with Hebrew words and English glosses
 */

interface WordTranslation {
  word: string;
  translation: string;
  transliteration?: string;
}

interface BibleVerse {
  verse: number;
  text: string;
  words?: string[];
  wordTranslations?: WordTranslation[];
}

interface BibleChapter {
  chapter: number;
  verses: BibleVerse[];
}

interface BibleBook {
  book: string;
  bookId: string;
  chapters: BibleChapter[];
}

/**
 * Download a file from URL
 */
function downloadFile(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log(`Downloading: ${url}`);
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * Parse a single line of STEPBible data
 * Format: Ref\tHebrew\tTransliteration\tTranslation\tdStrongs\tGrammar\t...
 */
function parseLine(line: string): { chapter: number; verse: number; word: string; translation: string; transliteration: string; } | null {
  const parts = line.split('\t');
  
  // Must have at least 4 columns: Ref, Hebrew, Transliteration, Translation
  if (parts.length < 4) return null;
  
  const ref = parts[0];  // e.g., "Gen.001.002#01=L"
  const hebrew = parts[1];  // e.g., "וְ/הָ/אָ֗רֶץ"
  const transliteration = parts[2];  // e.g., "ve./ha./'A.retz"
  const translation = parts[3];  // e.g., "and/ the/ earth"
  
  // Skip header lines, empty lines, and summary lines starting with "#"
  if (!ref || ref.startsWith('#') || ref.startsWith('$') || ref.startsWith('Eng')) {
    return null;
  }
  
  // Parse reference: Gen.001.002#01 = Genesis chapter 1 verse 2 word 1
  const match = ref.match(/^[A-Za-z]+\.(\d+)\.(\d+)/);
  if (!match) return null;
  
  const chapter = parseInt(match[1]);
  const verse = parseInt(match[2]);
  
  // Remove forward slashes from translation (they separate prefixes/suffixes)
  const cleanTranslation = translation.replace(/\//g, '').trim();
  
  // Remove <> and [] brackets from translation
  const finalTranslation = cleanTranslation
    .replace(/<[^>]*>/g, '')  // Remove <obj.>, <it> was, etc.
    .replace(/\[[^\]]*\]/g, '')  // Remove [was], [the], etc.
    .trim();
  
  // Clean Hebrew word (remove pointing/cantillation for display)
  const cleanHebrew = hebrew.split(/[\/\\]/)[0] || hebrew;
  
  return {
    chapter,
    verse,
    word: cleanHebrew,
    translation: finalTranslation || cleanTranslation,  // Fallback if everything was removed
    transliteration: transliteration.replace(/\//g, '')
  };
}

/**
 * Process Genesis from STEPBible data
 */
async function importGenesis() {
  console.log('\n🚀 Importing Genesis from STEPBible...\n');
  
  const url = 'https://raw.githubusercontent.com/STEPBible/STEPBible-Data/master/Translators%20Amalgamated%20OT%2BNT/TAHOT%20Gen-Deu%20-%20Translators%20Amalgamated%20Hebrew%20OT%20-%20STEPBible.org%20CC%20BY.txt';
  
  const content = await downloadFile(url);
  const lines = content.split('\n');
  
  console.log(`Downloaded ${lines.length} lines`);
  
  // Parse all lines
  const parsed: Array<{ chapter: number; verse: number; word: string; translation: string; transliteration: string; }> = [];
  
  for (const line of lines) {
    const result = parseLine(line);
    if (result) {
      parsed.push(result);
    }
  }
  
  console.log(`Parsed ${parsed.length} words`);
  
  // Group by chapter and verse
  const verseMap = new Map<string, WordTranslation[]>();
  
  for (const item of parsed) {
    const key = `${item.chapter}:${item.verse}`;
    if (!verseMap.has(key)) {
      verseMap.set(key, []);
    }
    verseMap.get(key)!.push({
      word: item.word,
      translation: item.translation,
      transliteration: item.transliteration
    });
  }
  
  console.log(`Found ${verseMap.size} unique verses`);
  
  // Update Genesis JSON file
  const genesisPath = path.join(process.cwd(), 'src', 'data', 'bible', 'hebrew', 'genesis.json');
  
  if (!fs.existsSync(genesisPath)) {
    console.log('❌ Genesis file not found');
    return;
  }
  
  const genesisData: BibleBook = JSON.parse(fs.readFileSync(genesisPath, 'utf-8'));
  let totalWordsAdded = 0;
  
  for (const chapter of genesisData.chapters) {
    for (const verse of chapter.verses) {
      const key = `${chapter.chapter}:${verse.verse}`;
      const wordTranslations = verseMap.get(key);
      
      if (wordTranslations && wordTranslations.length > 0) {
        verse.wordTranslations = wordTranslations;
        totalWordsAdded += wordTranslations.length;
      }
    }
  }
  
  // Save updated file
  fs.writeFileSync(genesisPath, JSON.stringify(genesisData, null, 2));
  
  console.log(`\n✅ Successfully added translations for ${totalWordsAdded} words in Genesis!`);
  console.log(`\nExample from Genesis 1:1:`);
  const gen1_1 = genesisData.chapters[0].verses[0];
  if (gen1_1.wordTranslations) {
    gen1_1.wordTranslations.slice(0, 5).forEach((wt, i) => {
      console.log(`  ${i + 1}. ${wt.word} = ${wt.translation}`);
    });
  }
}

// Run the import
importGenesis().catch(console.error);
