/**
 * Bible-related TypeScript type definitions
 */

export interface BibleVerse {
  verse: number;
  text: string;
  words?: string[]; // Optional: Individual Hebrew words
}

export interface BibleChapter {
  chapter: number;
  verses: BibleVerse[];
}

export interface BibleBook {
  id: string;
  name: string;              // Hebrew name or Greek name
  nameEnglish: string;
  testament: 'tanakh' | 'new' | 'new-testament';
  order: number;
  totalChapters: number;
  abbreviation: string;
}

export interface BibleBookData {
  book: {
    id: string;
    name: string;            // Hebrew name or Greek name
    nameEnglish?: string;
    nameGreek?: string;      // Greek name for NT books
    nameHebrew?: string;     // Hebrew name for Tanakh books
    testament: 'tanakh' | 'new' | 'new-testament';
    order?: number;
    totalChapters?: number;
    totalVerses?: number;
    language?: string;
    abbreviation?: string;
  };
  chapters: BibleChapter[];
}

export interface BibleMetadata {
  books: BibleBook[];
  totalBooks: number;
  totalChapters: number;
  totalVerses: number;
}
