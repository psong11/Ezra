/**
 * MASTER BOOK CONFIGURATION
 * 
 * This file contains the complete metadata for all Tanakh books.
 * To add a new book, simply add its entry here and run the automated scripts.
 * 
 * The order field determines the book's position in the Tanakh.
 */

export interface BookConfig {
  xmlFile: string;        // Name of XML file in data/
  bookId: string;         // URL-safe ID (lowercase, no spaces)
  nameEnglish: string;    // English display name
  nameHebrew: string;     // Hebrew display name (extracted from XML, but can override)
  abbreviation: string;   // Short abbreviation
  order: number;          // Position in Tanakh (1-39)
  testament: 'torah' | 'prophets' | 'writings';  // Section of Tanakh
  totalChapters?: number; // Will be auto-detected from XML if not provided
}

export const TANAKH_BOOKS: BookConfig[] = [
  // TORAH (תורה) - Law - 5 books
  {
    xmlFile: 'Genesis.xml',
    bookId: 'genesis',
    nameEnglish: 'Genesis',
    nameHebrew: 'בראשית',
    abbreviation: 'Gen',
    order: 1,
    testament: 'torah',
    totalChapters: 50
  },
  {
    xmlFile: 'Exodus.xml',
    bookId: 'exodus',
    nameEnglish: 'Exodus',
    nameHebrew: 'שמות',
    abbreviation: 'Exod',
    order: 2,
    testament: 'torah',
    totalChapters: 40
  },
  {
    xmlFile: 'Leviticus.xml',
    bookId: 'leviticus',
    nameEnglish: 'Leviticus',
    nameHebrew: 'ויקרא',
    abbreviation: 'Lev',
    order: 3,
    testament: 'torah',
    totalChapters: 27
  },
  {
    xmlFile: 'Numbers.xml',
    bookId: 'numbers',
    nameEnglish: 'Numbers',
    nameHebrew: 'במדבר',
    abbreviation: 'Num',
    order: 4,
    testament: 'torah',
    totalChapters: 36
  },
  {
    xmlFile: 'Deuteronomy.xml',
    bookId: 'deuteronomy',
    nameEnglish: 'Deuteronomy',
    nameHebrew: 'דברים',
    abbreviation: 'Deut',
    order: 5,
    testament: 'torah',
    totalChapters: 34
  },

  // NEVI'IM (נביאים) - Prophets - 21 books
  // Former Prophets (6 books)
  {
    xmlFile: 'Joshua.xml',
    bookId: 'joshua',
    nameEnglish: 'Joshua',
    nameHebrew: 'יהושע',
    abbreviation: 'Josh',
    order: 6,
    testament: 'prophets',
    totalChapters: 24
  },
  {
    xmlFile: 'Judges.xml',
    bookId: 'judges',
    nameEnglish: 'Judges',
    nameHebrew: 'שופטים',
    abbreviation: 'Judg',
    order: 7,
    testament: 'prophets',
    totalChapters: 21
  },
  {
    xmlFile: 'Samuel_1.xml',
    bookId: '1-samuel',
    nameEnglish: '1 Samuel',
    nameHebrew: 'שמואל א',
    abbreviation: '1 Sam',
    order: 8,
    testament: 'prophets',
    totalChapters: 31
  },
  {
    xmlFile: 'Samuel_2.xml',
    bookId: '2-samuel',
    nameEnglish: '2 Samuel',
    nameHebrew: 'שמואל ב',
    abbreviation: '2 Sam',
    order: 9,
    testament: 'prophets',
    totalChapters: 24
  },
  {
    xmlFile: 'Kings_1.xml',
    bookId: '1-kings',
    nameEnglish: '1 Kings',
    nameHebrew: 'מלכים א',
    abbreviation: '1 Kgs',
    order: 10,
    testament: 'prophets',
    totalChapters: 22
  },
  {
    xmlFile: 'Kings_2.xml',
    bookId: '2-kings',
    nameEnglish: '2 Kings',
    nameHebrew: 'מלכים ב',
    abbreviation: '2 Kgs',
    order: 11,
    testament: 'prophets',
    totalChapters: 25
  },

  // Major Prophets (3 books)
  {
    xmlFile: 'Isaiah.xml',
    bookId: 'isaiah',
    nameEnglish: 'Isaiah',
    nameHebrew: 'ישעיה',
    abbreviation: 'Isa',
    order: 12,
    testament: 'prophets',
    totalChapters: 66
  },
  {
    xmlFile: 'Jeremiah.xml',
    bookId: 'jeremiah',
    nameEnglish: 'Jeremiah',
    nameHebrew: 'ירמיה',
    abbreviation: 'Jer',
    order: 13,
    testament: 'prophets',
    totalChapters: 52
  },
  {
    xmlFile: 'Ezekiel.xml',
    bookId: 'ezekiel',
    nameEnglish: 'Ezekiel',
    nameHebrew: 'יחזקאל',
    abbreviation: 'Ezek',
    order: 14,
    testament: 'prophets',
    totalChapters: 48
  },

  // Minor Prophets (12 books)
  {
    xmlFile: 'Hosea.xml',
    bookId: 'hosea',
    nameEnglish: 'Hosea',
    nameHebrew: 'הושע',
    abbreviation: 'Hos',
    order: 15,
    testament: 'prophets',
    totalChapters: 14
  },
  {
    xmlFile: 'Joel.xml',
    bookId: 'joel',
    nameEnglish: 'Joel',
    nameHebrew: 'יואל',
    abbreviation: 'Joel',
    order: 16,
    testament: 'prophets',
    totalChapters: 4
  },
  {
    xmlFile: 'Amos.xml',
    bookId: 'amos',
    nameEnglish: 'Amos',
    nameHebrew: 'עמוס',
    abbreviation: 'Amos',
    order: 17,
    testament: 'prophets',
    totalChapters: 9
  },
  {
    xmlFile: 'Obadiah.xml',
    bookId: 'obadiah',
    nameEnglish: 'Obadiah',
    nameHebrew: 'עובדיה',
    abbreviation: 'Obad',
    order: 18,
    testament: 'prophets',
    totalChapters: 1
  },
  {
    xmlFile: 'Jonah.xml',
    bookId: 'jonah',
    nameEnglish: 'Jonah',
    nameHebrew: 'יונה',
    abbreviation: 'Jonah',
    order: 19,
    testament: 'prophets',
    totalChapters: 4
  },
  {
    xmlFile: 'Micah.xml',
    bookId: 'micah',
    nameEnglish: 'Micah',
    nameHebrew: 'מיכה',
    abbreviation: 'Mic',
    order: 20,
    testament: 'prophets',
    totalChapters: 7
  },
  {
    xmlFile: 'Nahum.xml',
    bookId: 'nahum',
    nameEnglish: 'Nahum',
    nameHebrew: 'נחום',
    abbreviation: 'Nah',
    order: 21,
    testament: 'prophets',
    totalChapters: 3
  },
  {
    xmlFile: 'Habakkuk.xml',
    bookId: 'habakkuk',
    nameEnglish: 'Habakkuk',
    nameHebrew: 'חבקוק',
    abbreviation: 'Hab',
    order: 22,
    testament: 'prophets',
    totalChapters: 3
  },
  {
    xmlFile: 'Zephaniah.xml',
    bookId: 'zephaniah',
    nameEnglish: 'Zephaniah',
    nameHebrew: 'צפניה',
    abbreviation: 'Zeph',
    order: 23,
    testament: 'prophets',
    totalChapters: 3
  },
  {
    xmlFile: 'Haggai.xml',
    bookId: 'haggai',
    nameEnglish: 'Haggai',
    nameHebrew: 'חגי',
    abbreviation: 'Hag',
    order: 24,
    testament: 'prophets',
    totalChapters: 2
  },
  {
    xmlFile: 'Zechariah.xml',
    bookId: 'zechariah',
    nameEnglish: 'Zechariah',
    nameHebrew: 'זכריה',
    abbreviation: 'Zech',
    order: 25,
    testament: 'prophets',
    totalChapters: 14
  },
  {
    xmlFile: 'Malachi.xml',
    bookId: 'malachi',
    nameEnglish: 'Malachi',
    nameHebrew: 'מלאכי',
    abbreviation: 'Mal',
    order: 26,
    testament: 'prophets',
    totalChapters: 3
  },

  // KETUVIM (כתובים) - Writings - 13 books
  {
    xmlFile: 'Psalms.xml',
    bookId: 'psalms',
    nameEnglish: 'Psalms',
    nameHebrew: 'תהלים',
    abbreviation: 'Ps',
    order: 27,
    testament: 'writings',
    totalChapters: 150
  },
  {
    xmlFile: 'Proverbs.xml',
    bookId: 'proverbs',
    nameEnglish: 'Proverbs',
    nameHebrew: 'משלי',
    abbreviation: 'Prov',
    order: 28,
    testament: 'writings',
    totalChapters: 31
  },
  {
    xmlFile: 'Job.xml',
    bookId: 'job',
    nameEnglish: 'Job',
    nameHebrew: 'איוב',
    abbreviation: 'Job',
    order: 29,
    testament: 'writings',
    totalChapters: 42
  },
  {
    xmlFile: 'Song_of_Songs.xml',
    bookId: 'song-of-songs',
    nameEnglish: 'Song of Songs',
    nameHebrew: 'שיר השירים',
    abbreviation: 'Song',
    order: 30,
    testament: 'writings',
    totalChapters: 8
  },
  {
    xmlFile: 'Ruth.xml',
    bookId: 'ruth',
    nameEnglish: 'Ruth',
    nameHebrew: 'רות',
    abbreviation: 'Ruth',
    order: 31,
    testament: 'writings',
    totalChapters: 4
  },
  {
    xmlFile: 'Lamentations.xml',
    bookId: 'lamentations',
    nameEnglish: 'Lamentations',
    nameHebrew: 'איכה',
    abbreviation: 'Lam',
    order: 32,
    testament: 'writings',
    totalChapters: 5
  },
  // TODO: Add remaining 7 books: Ecclesiastes, Esther, Daniel, Ezra, Nehemiah, Chronicles 1&2
];

// Helper function to get books by testament
export function getBooksByTestament(testament: 'torah' | 'prophets' | 'writings'): BookConfig[] {
  return TANAKH_BOOKS.filter(book => book.testament === testament);
}

// Helper function to get book by ID
export function getBookById(bookId: string): BookConfig | undefined {
  return TANAKH_BOOKS.find(book => book.bookId === bookId);
}

// Statistics
export const TANAKH_STATS = {
  totalBooks: TANAKH_BOOKS.length,
  torah: getBooksByTestament('torah').length,
  prophets: getBooksByTestament('prophets').length,
  writings: getBooksByTestament('writings').length,
};
