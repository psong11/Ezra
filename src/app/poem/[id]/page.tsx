'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Poem } from '@/types/poem';
import { TTSControls } from '@/components/TTSControls';

export default function PoemPage() {
  const params = useParams();
  const id = params?.id as string;
  const [poem, setPoem] = useState<Poem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchPoem() {
      try {
        const response = await fetch(`/api/poems/${id}`);
        if (!response.ok) {
          throw new Error('Poem not found');
        }
        const data = await response.json();
        setPoem(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchPoem();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading poem...</p>
        </div>
      </div>
    );
  }

  if (error || !poem) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-xl text-red-400 mb-4">
            {error || 'Poem not found'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to all poems
          </Link>
        </div>
      </div>
    );
  }

  const langCode = poem.id.split('-')[0];

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <Link
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to all poems
          </Link>
        </nav>

        {/* Poem Content */}
        {/* TTS Controls */}
        <div className="mb-6">
          <TTSControls
            text={poem.content}
            languageCode={langCode}
          />
        </div>

        <article className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8 sm:p-12">
          {/* Language Badge */}
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 text-sm">
              {poem.language}
            </span>
          </div>

          {/* Title */}
          <h1
            className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-8 ${
              poem.isRTL ? 'text-right' : 'text-left'
            }`}
            dir={poem.isRTL ? 'rtl' : 'ltr'}
            lang={langCode}
          >
            {poem.title}
          </h1>

          {/* Poem Text */}
          <div
            className={`prose prose-invert max-w-none ${
              poem.isRTL ? 'text-right' : 'text-left'
            }`}
            dir={poem.isRTL ? 'rtl' : 'ltr'}
            lang={langCode}
          >
            <pre className="whitespace-pre-wrap font-sans text-lg leading-relaxed text-gray-200">
              {poem.content}
            </pre>
          </div>
        </article>

        {/* Navigation Footer */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Explore more poems
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
