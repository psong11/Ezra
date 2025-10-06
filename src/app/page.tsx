'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Poem } from '@/types/poem';

export default function Home() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [filteredPoems, setFilteredPoems] = useState<Poem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPoems() {
      try {
        const response = await fetch('/api/poems');
        if (!response.ok) {
          throw new Error('Failed to fetch poems');
        }
        const data = await response.json();
        setPoems(data);
        setFilteredPoems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchPoems();
  }, []);

  useEffect(() => {
    const filtered = poems.filter(
      poem =>
        poem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poem.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poem.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPoems(filtered);
  }, [searchTerm, poems]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading poems...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-400">
          <p className="text-xl mb-2">Error loading poems</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Ezra
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            A Multilingual Poetry Collection
          </p>
          <p className="text-sm text-gray-400">
            {poems.length} poems in {new Set(poems.map(p => p.language)).size} languages
          </p>
        </header>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <label htmlFor="search" className="sr-only">
            Search poems
          </label>
          <div className="relative">
            <input
              id="search"
              type="text"
              placeholder="Search by title, language, or filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              aria-label="Search poems by title, language, or filename"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                aria-label="Clear search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-gray-400">
              Found {filteredPoems.length} {filteredPoems.length === 1 ? 'poem' : 'poems'}
            </p>
          )}
        </div>

        {/* Poems Grid */}
        {filteredPoems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No poems found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPoems.map((poem) => (
              <Link
                key={poem.id}
                href={`/poem/${poem.id}`}
                className="group block bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                <article>
                  <h2
                    className={`text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2 ${
                      poem.isRTL ? 'text-right' : 'text-left'
                    }`}
                    dir={poem.isRTL ? 'rtl' : 'ltr'}
                    lang={poem.id.split('-')[0]}
                  >
                    {poem.title}
                  </h2>
                  <p className="text-sm text-gray-400 mb-3">{poem.language}</p>
                  <div
                    className={`text-sm text-gray-300 line-clamp-3 ${
                      poem.isRTL ? 'text-right' : 'text-left'
                    }`}
                    dir={poem.isRTL ? 'rtl' : 'ltr'}
                    lang={poem.id.split('-')[0]}
                  >
                    {poem.content.split('\n').slice(1, 4).join('\n')}
                  </div>
                  <div className="mt-4 flex items-center text-blue-400 text-sm group-hover:translate-x-1 transition-transform">
                    Read more
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Built with Next.js, React, TypeScript, and Tailwind CSS</p>
        </footer>
      </div>
    </main>
  );
}
