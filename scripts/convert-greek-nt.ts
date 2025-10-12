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
  // Gospels
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
  {
    xmlFile: 'Mark.xml',
    bookId: 'mark',
    nameEnglish: 'Mark',
    nameGreek: 'ΚΑΤΑ ΜΑΡΚΟΝ',
    abbreviation: 'Mark',
    order: 2,
    testament: 'new-testament',
    totalChapters: 16
  },
  {
    xmlFile: 'Luke.xml',
    bookId: 'luke',
    nameEnglish: 'Luke',
    nameGreek: 'ΚΑΤΑ ΛΟΥΚΑΝ',
    abbreviation: 'Luke',
    order: 3,
    testament: 'new-testament',
    totalChapters: 24
  },
  {
    xmlFile: 'John.xml',
    bookId: 'john',
    nameEnglish: 'John',
    nameGreek: 'ΚΑΤΑ ΙΩΑΝΝΗΝ',
    abbreviation: 'John',
    order: 4,
    testament: 'new-testament',
    totalChapters: 21
  },
  
  // Acts
  {
    xmlFile: 'Acts.xml',
    bookId: 'acts',
    nameEnglish: 'Acts',
    nameGreek: 'ΠΡΑΞΕΙΣ ΑΠΟΣΤΟΛΩΝ',
    abbreviation: 'Acts',
    order: 5,
    testament: 'new-testament',
    totalChapters: 28
  },
  
  // Paul's Letters
  {
    xmlFile: 'Rom.xml',
    bookId: 'romans',
    nameEnglish: 'Romans',
    nameGreek: 'ΠΡΟΣ ΡΩΜΑΙΟΥΣ',
    abbreviation: 'Rom',
    order: 6,
    testament: 'new-testament',
    totalChapters: 16
  },
  {
    xmlFile: '1Cor.xml',
    bookId: '1-corinthians',
    nameEnglish: '1 Corinthians',
    nameGreek: 'ΠΡΟΣ ΚΟΡΙΝΘΙΟΥΣ Α',
    abbreviation: '1Cor',
    order: 7,
    testament: 'new-testament',
    totalChapters: 16
  },
  {
    xmlFile: '2Cor.xml',
    bookId: '2-corinthians',
    nameEnglish: '2 Corinthians',
    nameGreek: 'ΠΡΟΣ ΚΟΡΙΝΘΙΟΥΣ Β',
    abbreviation: '2Cor',
    order: 8,
    testament: 'new-testament',
    totalChapters: 13
  },
  {
    xmlFile: 'Gal.xml',
    bookId: 'galatians',
    nameEnglish: 'Galatians',
    nameGreek: 'ΠΡΟΣ ΓΑΛΑΤΑΣ',
    abbreviation: 'Gal',
    order: 9,
    testament: 'new-testament',
    totalChapters: 6
  },
  {
    xmlFile: 'Eph.xml',
    bookId: 'ephesians',
    nameEnglish: 'Ephesians',
    nameGreek: 'ΠΡΟΣ ΕΦΕΣΙΟΥΣ',
    abbreviation: 'Eph',
    order: 10,
    testament: 'new-testament',
    totalChapters: 6
  },
  {
    xmlFile: 'Phil.xml',
    bookId: 'philippians',
    nameEnglish: 'Philippians',
    nameGreek: 'ΠΡΟΣ ΦΙΛΙΠΠΗΣΙΟΥΣ',
    abbreviation: 'Phil',
    order: 11,
    testament: 'new-testament',
    totalChapters: 4
  },
  {
    xmlFile: 'Col.xml',
    bookId: 'colossians',
    nameEnglish: 'Colossians',
    nameGreek: 'ΠΡΟΣ ΚΟΛΟΣΣΑΕΙΣ',
    abbreviation: 'Col',
    order: 12,
    testament: 'new-testament',
    totalChapters: 4
  },
  {
    xmlFile: '1Thess.xml',
    bookId: '1-thessalonians',
    nameEnglish: '1 Thessalonians',
    nameGreek: 'ΠΡΟΣ ΘΕΣΣΑΛΟΝΙΚΕΙΣ Α',
    abbreviation: '1Thess',
    order: 13,
    testament: 'new-testament',
    totalChapters: 5
  },
  {
    xmlFile: '2Thess.xml',
    bookId: '2-thessalonians',
    nameEnglish: '2 Thessalonians',
    nameGreek: 'ΠΡΟΣ ΘΕΣΣΑΛΟΝΙΚΕΙΣ Β',
    abbreviation: '2Thess',
    order: 14,
    testament: 'new-testament',
    totalChapters: 3
  },
  {
    xmlFile: '1Tim.xml',
    bookId: '1-timothy',
    nameEnglish: '1 Timothy',
    nameGreek: 'ΠΡΟΣ ΤΙΜΟΘΕΟΝ Α',
    abbreviation: '1Tim',
    order: 15,
    testament: 'new-testament',
    totalChapters: 6
  },
  {
    xmlFile: '2Tim.xml',
    bookId: '2-timothy',
    nameEnglish: '2 Timothy',
    nameGreek: 'ΠΡΟΣ ΤΙΜΟΘΕΟΝ Β',
    abbreviation: '2Tim',
    order: 16,
    testament: 'new-testament',
    totalChapters: 4
  },
  {
    xmlFile: 'Titus.xml',
    bookId: 'titus',
    nameEnglish: 'Titus',
    nameGreek: 'ΠΡΟΣ ΤΙΤΟΝ',
    abbreviation: 'Titus',
    order: 17,
    testament: 'new-testament',
    totalChapters: 3
  },
  {
    xmlFile: 'Phlm.xml',
    bookId: 'philemon',
    nameEnglish: 'Philemon',
    nameGreek: 'ΠΡΟΣ ΦΙΛΗΜΟΝΑ',
    abbreviation: 'Phlm',
    order: 18,
    testament: 'new-testament',
    totalChapters: 1
  },
  
  // General Epistles
  {
    xmlFile: 'Heb.xml',
    bookId: 'hebrews',
    nameEnglish: 'Hebrews',
    nameGreek: 'ΠΡΟΣ ΕΒΡΑΙΟΥΣ',
    abbreviation: 'Heb',
    order: 19,
    testament: 'new-testament',
    totalChapters: 13
  },
  {
    xmlFile: 'Jas.xml',
    bookId: 'james',
    nameEnglish: 'James',
    nameGreek: 'ΙΑΚΩΒΟΥ',
    abbreviation: 'Jas',
    order: 20,
    testament: 'new-testament',
    totalChapters: 5
  },
  {
    xmlFile: '1Pet.xml',
    bookId: '1-peter',
    nameEnglish: '1 Peter',
    nameGreek: 'ΠΕΤΡΟΥ Α',
    abbreviation: '1Pet',
    order: 21,
    testament: 'new-testament',
    totalChapters: 5
  },
  {
    xmlFile: '2Pet.xml',
    bookId: '2-peter',
    nameEnglish: '2 Peter',
    nameGreek: 'ΠΕΤΡΟΥ Β',
    abbreviation: '2Pet',
    order: 22,
    testament: 'new-testament',
    totalChapters: 3
  },
  {
    xmlFile: '1John.xml',
    bookId: '1-john',
    nameEnglish: '1 John',
    nameGreek: 'ΙΩΑΝΝΟΥ Α',
    abbreviation: '1John',
    order: 23,
    testament: 'new-testament',
    totalChapters: 5
  },
  {
    xmlFile: '2John.xml',
    bookId: '2-john',
    nameEnglish: '2 John',
    nameGreek: 'ΙΩΑΝΝΟΥ Β',
    abbreviation: '2John',
    order: 24,
    testament: 'new-testament',
    totalChapters: 1
  },
  {
    xmlFile: '3John.xml',
    bookId: '3-john',
    nameEnglish: '3 John',
    nameGreek: 'ΙΩΑΝΝΟΥ Γ',
    abbreviation: '3John',
    order: 25,
    testament: 'new-testament',
    totalChapters: 1
  },
  {
    xmlFile: 'Jude.xml',
    bookId: 'jude',
    nameEnglish: 'Jude',
    nameGreek: 'ΙΟΥΔΑ',
    abbreviation: 'Jude',
    order: 26,
    testament: 'new-testament',
    totalChapters: 1
  },
  
  // Revelation
  {
    xmlFile: 'Rev.xml',
    bookId: 'revelation',
    nameEnglish: 'Revelation',
    nameGreek: 'ΑΠΟΚΑΛΥΨΙΣ ΙΩΑΝΝΟΥ',
    abbreviation: 'Rev',
    order: 27,
    testament: 'new-testament',
    totalChapters: 22
  },
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
  
  // Extract all verse-number elements with a universal regex
  const verseRegex = /<verse-number id="[^"]+?(\d+):(\d+)">[^<]*<\/verse-number>/g;
  let match;
  const verseStarts: { chapter: number; verse: number; startIndex: number; endTagIndex: number }[] = [];
  
  while ((match = verseRegex.exec(xmlContent)) !== null) {
    verseStarts.push({
      chapter: parseInt(match[1]),
      verse: parseInt(match[2]),
      startIndex: match.index,  // Where the <verse-number> tag starts
      endTagIndex: match.index + match[0].length  // Where the content after </verse-number> starts
    });
  }
  
  // Process each verse
  for (let i = 0; i < verseStarts.length; i++) {
    const verseStart = verseStarts[i];
    // Calculate where the next verse tag starts (or use end of content)
    const nextVerseStart = i < verseStarts.length - 1 ? verseStarts[i + 1].startIndex : xmlContent.length;
    
    // Extract content between this verse and the next
    const verseContent = xmlContent.substring(verseStart.endTagIndex, nextVerseStart);
    
    // Extract words
    const words: string[] = [];
    const wordRegex = /<w>(.*?)<\/w>/g;
    let wordMatch;
    while ((wordMatch = wordRegex.exec(verseContent)) !== null) {
      words.push(wordMatch[1]);
    }
    
    // Build full text with proper spacing
    let fullText = words.join(' ');
    
    // Add punctuation from suffixes  
    const suffixRegex = /<suffix>(.*?)<\/suffix>/g;
    let suffixMatch;
    while ((suffixMatch = suffixRegex.exec(verseContent)) !== null) {
      const punct = suffixMatch[1].trim();
      if (punct) {
        fullText += punct;
      }
    }
    
    // Clean up multiple spaces
    fullText = fullText.replace(/\s+/g, ' ').trim();
    
    // Add to chapter map
    if (!chapterMap.has(verseStart.chapter)) {
      chapterMap.set(verseStart.chapter, []);
    }
    
    chapterMap.get(verseStart.chapter)!.push({
      verse: verseStart.verse,
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
