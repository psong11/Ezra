/**
 * Bible Chapter Reader Page
 * Displays a specific chapter with verse-by-verse rendering and TTS capability
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BIBLE_BOOKS } from '@/data/bibleBooks';
import { loadBook, getChapter } from '@/lib/bibleLoader';
import ChapterReader from './ChapterReader';

interface Props {
  params: {
    bookId: string;
    chapter: string;
  };
}

export default async function ChapterPage({ params }: Props) {
  const book = BIBLE_BOOKS.find(b => b.id === params.bookId);
  const chapterNum = parseInt(params.chapter);

  if (!book || isNaN(chapterNum) || chapterNum < 1 || chapterNum > book.totalChapters) {
    notFound();
  }

  // Load the book data
  const bookData = await loadBook(params.bookId);
  const chapterData = getChapter(bookData, chapterNum);

  // Calculate previous/next chapters
  const prevChapter = chapterNum > 1 ? chapterNum - 1 : null;
  const nextChapter = chapterNum < book.totalChapters ? chapterNum + 1 : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <Link
            href="/bible"
            className="text-amber-600 hover:text-amber-700 font-medium"
          >
            Books
          </Link>
          <span className="text-gray-400">/</span>
          <Link
            href={`/bible/${book.id}`}
            className="text-amber-600 hover:text-amber-700 font-medium"
          >
            {book.nameEnglish}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">Chapter {chapterNum}</span>
        </div>

        {/* Chapter Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {book.nameEnglish} {chapterNum}
          </h1>
          <h2 className="text-3xl font-bold text-gray-700" dir="rtl">
            {book.name} {chapterNum}
          </h2>
        </div>

        {/* Chapter Reader Component (Client-side for TTS) */}
        <ChapterReader
          bookData={bookData}
          bookName={book.nameEnglish}
          hebrewName={book.name}
          chapterNum={chapterNum}
          chapterData={chapterData}
          isHebrew={book.testament === 'tanakh'}
        />

        {/* Navigation */}
        <div className="mt-12 flex justify-between items-center">
          <div>
            {prevChapter && (
              <Link
                href={`/bible/${book.id}/${prevChapter}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <span>←</span>
                <span>Chapter {prevChapter}</span>
              </Link>
            )}
          </div>
          
          <Link
            href={`/bible/${book.id}`}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            All Chapters
          </Link>

          <div>
            {nextChapter && (
              <Link
                href={`/bible/${book.id}/${nextChapter}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <span>Chapter {nextChapter}</span>
                <span>→</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate static params for all chapters
export function generateStaticParams() {
  const params: { bookId: string; chapter: string }[] = [];
  
  for (const book of BIBLE_BOOKS) {
    for (let i = 1; i <= book.totalChapters; i++) {
      params.push({
        bookId: book.id,
        chapter: i.toString(),
      });
    }
  }
  
  return params;
}
