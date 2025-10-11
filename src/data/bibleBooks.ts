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
  {
    id: 'exodus',
    name: 'שמות',
    nameEnglish: 'Exodus',
    testament: 'tanakh',
    order: 2,
    totalChapters: 40,
    abbreviation: 'Exod'
  },
  {
    id: 'leviticus',
    name: 'ויקרא',
    nameEnglish: 'Leviticus',
    testament: 'tanakh',
    order: 3,
    totalChapters: 27,
    abbreviation: 'Lev'
  },
  {
    id: 'numbers',
    name: 'במדבר',
    nameEnglish: 'Numbers',
    testament: 'tanakh',
    order: 4,
    totalChapters: 36,
    abbreviation: 'Num'
  },
  {
    id: 'deuteronomy',
    name: 'דברים',
    nameEnglish: 'Deuteronomy',
    testament: 'tanakh',
    order: 5,
    totalChapters: 34,
    abbreviation: 'Deut'
  },
  // TODO: Add remaining 34 books of Tanakh
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
