/**
 * GREEK NEW TESTAMENT XML CONVERTER
 * 
 * Converts Greek New Testament XML files to JSON format.
 * This handles a different XML structure than the Hebrew Bible.
 */

import * as fs from 'fs';
import * as path from 'path';

interface GreekNTConfig {
  xmlFile: string;
  bookId: string;
  nameEnglish: string;
  nameGreek: string;
  abbreviation: string;
  order: number;
  testament: 'new-testament';
  totalChapters: number;
}

const GREEK_NT_BOOKS: GreekNTConfig[] = [
  {
    xmlFile: 'Matt.xml',
    bookId: 'matthew',
    nameEnglish: 'Matthew',
    nameGreek: 'ΚΑΤΑ ΜΑΘΘΑΙΟΝ',
    abbreviation: 'Matt',
    order: 1,
    testament: 'new-testament',
    totalChapters: 28
  },
  // Add more NT books as they are provided
];

interface Verse {
  verse: number;
  text: string;
  words: string[];
}

interface Chapter {
  chapter: number;
  verses: Verse[];
}

interface BookData {
  book: {
    id: string;
    name: string;
    nameGreek: string;
    testament: string;
  };
  chapters: Chapter[];
}

function parseGreekNTXML(xmlContent: string, bookName: string): { chapter: number; verses: Verse[] }[] {
  const chapterMap = new Map<number, Verse[]>();
  
  // Extract title
  const titleMatch = xmlContent.match(/<title>(.*?)<\/title>/);
  const greekTitle = titleMatch ? titleMatch[1] : '';
  
  // Find all verse-number tags with their content
  const versePattern = /<verse-number id="Matthew (\d+):(\d+)">.*?<\/verse-number>/g;
  const wordPattern = /<w>(.*?)<\/w>/g;
  const suffixPattern = /<suffix>(.*?)<\/suffix>/g;
  const prefixPattern = /<prefix>(.*?)<\/prefix>/g;
  
  // Split content by verse markers
  const verses = xmlContent.split(/<verse-number id="Matthew /);
  
  for (let i = 1; i < verses.length; i++) {
    const verseContent = verses[i];
    
    // Extract chapter and verse numbers
    const match = verseContent.match(/^(\d+):(\d+)">/);
    if (!match) continue;
    
    const chapterNum = parseInt(match[1]);
    const verseNum = parseInt(match[2]);
    
    // Find the end of this verse (either next verse-number or end of paragraph)
    const nextVerseStart = verseContent.indexOf('<verse-number');
    const endIndex = nextVerseStart > 0 ? nextVerseStart : verseContent.length;
    const verseText = verseContent.substring(0, endIndex);
    
    // Extract words
    const words: string[] = [];
    let wordMatch;
    const wordRegex = /<w>(.*?)<\/w>/g;
    while ((wordMatch = wordRegex.exec(verseText)) !== null) {
      words.push(wordMatch[1]);
    }
    
    // Build full text with words and punctuation by joining words with spaces
    let fullText = words.join(' ');
    
    // Add punctuation from suffixes
    const suffixMatches = verseText.matchAll(/<suffix>(.*?)<\/suffix>/g);
    for (const match of suffixMatches) {
      const punct = match[1].trim();
      if (punct) {
        // Find where to insert punctuation
        fullText += punct;
      }
    }
    
    // Clean up multiple spaces
    fullText = fullText.replace(/\s+/g, ' ').trim();
    
    // Add to chapter map
    if (!chapterMap.has(chapterNum)) {
      chapterMap.set(chapterNum, []);
    }
    
    chapterMap.get(chapterNum)!.push({
      verse: verseNum,
      text: fullText,
      words: words
    });
  }
  
  // Convert map to sorted array
  const chapters: { chapter: number; verses: Verse[] }[] = [];
  for (const [chapterNum, verses] of Array.from(chapterMap.entries()).sort((a, b) => a[0] - b[0])) {
    chapters.push({
      chapter: chapterNum,
      verses: verses.sort((a, b) => a.verse - b.verse)
    });
  }
  
  return chapters;
}

async function convertGreekNTXMLToJSON(config: GreekNTConfig): Promise<void> {
  const dataDir = path.join(process.cwd(), 'data');
  const outputDir = path.join(process.cwd(), 'src', 'data', 'bible', 'greek');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const xmlPath = path.join(dataDir, config.xmlFile);
  const xmlContent = fs.readFileSync(xmlPath, 'utf-8');

  const chapters = parseGreekNTXML(xmlContent, config.nameEnglish);

  const bookData: BookData = {
    book: {
      id: config.bookId,
      name: config.nameEnglish,
      nameGreek: config.nameGreek,
      testament: 'new-testament'
    },
    chapters: chapters
  };

  const outputPath = path.join(outputDir, `${config.bookId}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(bookData, null, 2), 'utf-8');

  const totalVerses = bookData.chapters.reduce((sum, ch) => sum + ch.verses.length, 0);
  console.log(`✅ ${config.nameEnglish} converted (${bookData.chapters.length} chapters, ${totalVerses} verses)`);
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║   GREEK NEW TESTAMENT CONVERSION SYSTEM           ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  console.log(`📚 Processing ${GREEK_NT_BOOKS.length} book(s)...\n`);

  for (const book of GREEK_NT_BOOKS) {
    try {
      await convertGreekNTXMLToJSON(book);
    } catch (error) {
      console.error(`❌ Error converting ${book.nameEnglish}:`, error);
    }
  }

  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║              CONVERSION COMPLETE! 🎉              ║');
  console.log('╚════════════════════════════════════════════════════╝\n');
}

main().catch(console.error);
