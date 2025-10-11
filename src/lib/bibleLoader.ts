/**
 * Bible data loading utilities
 */

import { BibleBookData } from '@/types/bible';
import genesisData from '@/data/bible/hebrew/genesis.json';
import exodusData from '@/data/bible/hebrew/exodus.json';
import leviticusData from '@/data/bible/hebrew/leviticus.json';
import numbersData from '@/data/bible/hebrew/numbers.json';
import deuteronomyData from '@/data/bible/hebrew/deuteronomy.json';

/**
 * Load a Bible book's data
 */
export async function loadBook(bookId: string): Promise<BibleBookData> {
  // Load Torah books
  switch (bookId) {
    case 'genesis':
      return genesisData as BibleBookData;
    case 'exodus':
      return exodusData as BibleBookData;
    case 'leviticus':
      return leviticusData as BibleBookData;
    case 'numbers':
      return numbersData as BibleBookData;
    case 'deuteronomy':
      return deuteronomyData as BibleBookData;
    default:
      throw new Error(`Book not found: ${bookId}. Available books: genesis, exodus, leviticus, numbers, deuteronomy`);
  }
}

/**
 * Get the text of a specific chapter
 */
export function getChapterText(book: BibleBookData, chapter: number): string {
  const chapterData = book.chapters.find(c => c.chapter === chapter);
  if (!chapterData) {
    throw new Error(`Chapter ${chapter} not found in ${book.book.nameEnglish}`);
  }
  
  // Join all verses with a space
  return chapterData.verses.map(v => v.text).join(' ');
}

/**
 * Get the text of a specific verse
 */
export function getVerseText(
  book: BibleBookData, 
  chapter: number, 
  verse: number
): string {
  const chapterData = book.chapters.find(c => c.chapter === chapter);
  if (!chapterData) {
    throw new Error(`Chapter ${chapter} not found`);
  }
  
  const verseData = chapterData.verses.find(v => v.verse === verse);
  if (!verseData) {
    throw new Error(`Verse ${chapter}:${verse} not found`);
  }
  
  return verseData.text;
}

/**
 * Get a chapter with all its verses
 */
export function getChapter(book: BibleBookData, chapter: number) {
  const chapterData = book.chapters.find(c => c.chapter === chapter);
  if (!chapterData) {
    throw new Error(`Chapter ${chapter} not found in ${book.book.nameEnglish}`);
  }
  return chapterData;
}

/**
 * Get verse range as text
 */
export function getVerseRange(
  book: BibleBookData,
  chapter: number,
  startVerse: number,
  endVerse: number
): string {
  const chapterData = book.chapters.find(c => c.chapter === chapter);
  if (!chapterData) {
    throw new Error(`Chapter ${chapter} not found`);
  }

  const verses = chapterData.verses
    .filter(v => v.verse >= startVerse && v.verse <= endVerse)
    .map(v => v.text);

  return verses.join(' ');
}
