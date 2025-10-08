/**
 * Bible books metadata
 * This file contains information about all books in the Tanakh (Hebrew Bible)
 */

import { BibleBook } from '@/types/bible';

export const BIBLE_BOOKS: BibleBook[] = [
  // Torah (Law) - 5 books
  {
    id: 'genesis',
    name: 'בראשית',
    nameEnglish: 'Genesis',
    testament: 'tanakh',
    order: 1,
    totalChapters: 50,
    abbreviation: 'Gen'
  },
  // TODO: Add remaining 38 books of Tanakh
  // Exodus, Leviticus, Numbers, Deuteronomy (Torah)
  // Joshua - Esther (Prophets and Writings)
];

export const BIBLE_METADATA = {
  totalBooks: BIBLE_BOOKS.length,
  availableBooks: BIBLE_BOOKS.length,
  totalChapters: BIBLE_BOOKS.reduce((sum, book) => sum + book.totalChapters, 0),
};

export const BOOK_CATEGORIES = {
  torah: {
    name: 'Torah',
    hebrewName: 'תורה',
    books: ['genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy']
  },
  prophets: {
    name: 'Prophets',
    hebrewName: 'נביאים',
    books: [] // To be added
  },
  writings: {
    name: 'Writings',
    hebrewName: 'כתובים',
    books: [] // To be added
  }
};
