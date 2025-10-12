import fs from 'fs';
import path from 'path';
import https from 'https';

// STEPBible Data Repository URLs
const STEPBIBLE_BASE_URL = 'https://raw.githubusercontent.com/STEPBible/STEPBible-Data/master';

// Greek NT files (27 books)
const GREEK_NT_BOOKS = [
  { id: 'matthew', file: '40-Mat-SBLGNT.txt', bookNum: '40' },
  { id: 'mark', file: '41-Mar-SBLGNT.txt', bookNum: '41' },
  { id: 'luke', file: '42-Luk-SBLGNT.txt', bookNum: '42' },
  { id: 'john', file: '43-Joh-SBLGNT.txt', bookNum: '43' },
  { id: 'acts', file: '44-Act-SBLGNT.txt', bookNum: '44' },
  { id: 'romans', file: '45-Rom-SBLGNT.txt', bookNum: '45' },
  { id: '1-corinthians', file: '46-1Co-SBLGNT.txt', bookNum: '46' },
  { id: '2-corinthians', file: '47-2Co-SBLGNT.txt', bookNum: '47' },
  { id: 'galatians', file: '48-Gal-SBLGNT.txt', bookNum: '48' },
  { id: 'ephesians', file: '49-Eph-SBLGNT.txt', bookNum: '49' },
  { id: 'philippians', file: '50-Php-SBLGNT.txt', bookNum: '50' },
  { id: 'colossians', file: '51-Col-SBLGNT.txt', bookNum: '51' },
  { id: '1-thessalonians', file: '52-1Th-SBLGNT.txt', bookNum: '52' },
  { id: '2-thessalonians', file: '53-2Th-SBLGNT.txt', bookNum: '53' },
  { id: '1-timothy', file: '54-1Ti-SBLGNT.txt', bookNum: '54' },
  { id: '2-timothy', file: '55-2Ti-SBLGNT.txt', bookNum: '55' },
  { id: 'titus', file: '56-Tit-SBLGNT.txt', bookNum: '56' },
  { id: 'philemon', file: '57-Phm-SBLGNT.txt', bookNum: '57' },
  { id: 'hebrews', file: '58-Heb-SBLGNT.txt', bookNum: '58' },
  { id: 'james', file: '59-Jas-SBLGNT.txt', bookNum: '59' },
  { id: '1-peter', file: '60-1Pe-SBLGNT.txt', bookNum: '60' },
  { id: '2-peter', file: '61-2Pe-SBLGNT.txt', bookNum: '61' },
  { id: '1-john', file: '62-1Jn-SBLGNT.txt', bookNum: '62' },
  { id: '2-john', file: '63-2Jn-SBLGNT.txt', bookNum: '63' },
  { id: '3-john', file: '64-3Jn-SBLGNT.txt', bookNum: '64' },
  { id: 'jude', file: '65-Jud-SBLGNT.txt', bookNum: '65' },
  { id: 'revelation', file: '66-Rev-SBLGNT.txt', bookNum: '66' }
];

// Hebrew OT files (39 books)
const HEBREW_OT_BOOKS = [
  { id: 'genesis', file: '01-Gen-OSHB.txt', bookNum: '01' },
  { id: 'exodus', file: '02-Exo-OSHB.txt', bookNum: '02' },
  { id: 'leviticus', file: '03-Lev-OSHB.txt', bookNum: '03' },
  { id: 'numbers', file: '04-Num-OSHB.txt', bookNum: '04' },
  { id: 'deuteronomy', file: '05-Deu-OSHB.txt', bookNum: '05' },
  // Add more books as needed
];

interface WordData {
  word: string;
  translation: string;
  transliteration?: string;
  strongs?: string;
  grammar?: string;
}

interface VerseData {
  verse: number;
  text: string;
  words?: string[];
  wordTranslations?: WordData[];
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
 * Parse STEPBible Greek NT format
 * Format: BookChapter:Verse Word Strongs=Number Morph=Code Lemma=Text Translit=Text Gloss=English
 */
function parseGreekVerse(line: string): { chapter: number; verse: number; wordData: WordData } | null {
  // Example line:
  // 400101001 Βίβλος N-NSF βίβλος G0976 βίβλος βίβλος Book
  
  const parts = line.trim().split(/\s+/);
  if (parts.length < 2) return null;

  const ref = parts[0]; // e.g., "400101001" = Matt 1:1 word 1
  const bookChapterVerse = ref.substring(0, 8); // "40010100"
  const chapter = parseInt(ref.substring(2, 5)); // "001" = 1
  const verse = parseInt(ref.substring(5, 8)); // "001" = 1
  
  const word = parts[1]; // Greek word
  let translation = '';
  let transliteration = '';
  let strongs = '';
  let grammar = '';

  // Parse remaining fields
  for (let i = 2; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith('G') && part.match(/^G\d+/)) {
      strongs = part;
    } else if (part.match(/^[A-Z]-/)) {
      // Grammar code like "N-NSF"
      grammar = part;
    } else if (part.match(/^[a-z]/)) {
      // Transliteration (all lowercase)
      if (!transliteration) transliteration = part;
    } else if (part.match(/^[A-Z][a-z]/)) {
      // English gloss (capitalized)
      translation = part;
    }
  }

  // Sometimes gloss is at the end
  if (!translation && parts.length > 3) {
    translation = parts[parts.length - 1];
  }

  return {
    chapter,
    verse,
    wordData: {
      word,
      translation: translation || 'unknown',
      transliteration,
      strongs,
      grammar
    }
  };
}

/**
 * Parse STEPBible Hebrew OT format
 */
function parseHebrewVerse(line: string): { chapter: number; verse: number; wordData: WordData } | null {
  // Similar to Greek but with Hebrew words and H-prefixed Strong's numbers
  const parts = line.trim().split(/\s+/);
  if (parts.length < 2) return null;

  const ref = parts[0];
  const chapter = parseInt(ref.substring(2, 5));
  const verse = parseInt(ref.substring(5, 8));
  
  const word = parts[1]; // Hebrew word
  let translation = '';
  let transliteration = '';
  let strongs = '';
  let grammar = '';

  for (let i = 2; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith('H') && part.match(/^H\d+/)) {
      strongs = part;
    } else if (part.match(/^H[A-Z]/)) {
      grammar = part;
    } else if (part.match(/^[a-z]/)) {
      if (!transliteration) transliteration = part;
    } else if (part.match(/^[A-Z][a-z]/)) {
      translation = part;
    }
  }

  if (!translation && parts.length > 3) {
    translation = parts[parts.length - 1];
  }

  return {
    chapter,
    verse,
    wordData: {
      word,
      translation: translation || 'unknown',
      transliteration,
      strongs,
      grammar
    }
  };
}

/**
 * Group words by verse
 */
function groupByVerse(parsedData: Array<{ chapter: number; verse: number; wordData: WordData }>): Map<string, WordData[]> {
  const verseMap = new Map<string, WordData[]>();
  
  for (const item of parsedData) {
    const key = `${item.chapter}:${item.verse}`;
    if (!verseMap.has(key)) {
      verseMap.set(key, []);
    }
    verseMap.get(key)!.push(item.wordData);
  }
  
  return verseMap;
}

/**
 * Update a book JSON file with word translations
 */
function updateBookFile(bookPath: string, verseMap: Map<string, WordData[]>) {
  console.log(`\nUpdating ${bookPath}...`);
  
  if (!fs.existsSync(bookPath)) {
    console.log(`  File not found, skipping`);
    return;
  }

  const bookData = JSON.parse(fs.readFileSync(bookPath, 'utf-8'));
  let totalWords = 0;

  for (const chapter of bookData.chapters) {
    for (const verse of chapter.verses) {
      const key = `${chapter.chapter}:${verse.verse}`;
      const wordTranslations = verseMap.get(key);
      
      if (wordTranslations && wordTranslations.length > 0) {
        // Only keep word, translation, and transliteration fields
        verse.wordTranslations = wordTranslations.map(w => ({
          word: w.word,
          translation: w.translation,
          transliteration: w.transliteration || undefined
        }));
        
        totalWords += wordTranslations.length;
      }
    }
  }

  fs.writeFileSync(bookPath, JSON.stringify(bookData, null, 2));
  console.log(`  ✅ Added translations for ${totalWords} words`);
}

/**
 * Process a single book
 */
async function processBook(bookInfo: { id: string; file: string; bookNum: string }, isGreek: boolean) {
  try {
    const url = `${STEPBIBLE_BASE_URL}/${isGreek ? 'SBLGNT - Translators Amalgamated OT+NT' : 'OSHB+Strongs - Hebrew OT'}/OSHB - OpenScripturesHebrewBible/${bookInfo.file}`;
    const content = await downloadFile(url);
    
    const lines = content.split('\n').filter(line => 
      line.trim() && 
      !line.startsWith('$') && 
      !line.startsWith('#')
    );

    const parsedData: Array<{ chapter: number; verse: number; wordData: WordData }> = [];
    
    for (const line of lines) {
      const parsed = isGreek ? parseGreekVerse(line) : parseHebrewVerse(line);
      if (parsed) {
        parsedData.push(parsed);
      }
    }

    const verseMap = groupByVerse(parsedData);
    
    // Update the corresponding JSON file
    const bookPath = path.join(process.cwd(), 'src', 'data', 'bible', isGreek ? 'greek' : 'hebrew', `${bookInfo.id}.json`);
    updateBookFile(bookPath, verseMap);

  } catch (error) {
    console.error(`❌ Error processing ${bookInfo.id}:`, error);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Importing STEPBible Data...\n');
  console.log('This will download interlinear data and add word-by-word English glosses.\n');

  // Process Greek NT books
  console.log('📖 Processing Greek New Testament...');
  for (const book of GREEK_NT_BOOKS.slice(0, 5)) { // Start with first 5 books
    await processBook(book, true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
  }

  // Process Hebrew OT books
  console.log('\n📖 Processing Hebrew Old Testament...');
  for (const book of HEBREW_OT_BOOKS.slice(0, 1)) { // Start with Genesis
    await processBook(book, false);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n✅ Import complete!');
  console.log('\nTo process more books, update the slice() ranges in the code.');
}

main();
