/**
 * In-Memory Cache for Word Explanations
 * Prevents duplicate API calls for the same word
 */

import { WordExplanationResponse } from '../openai/types';

interface CacheEntry {
  data: WordExplanationResponse;
  timestamp: number;
}

class WordExplanationCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly TTL = 1000 * 60 * 60 * 24; // 24 hours

  /**
   * Generate cache key from word + language + verse context
   */
  private generateKey(word: string, language: string, verse: string): string {
    return `${language}:${word}:${verse}`.toLowerCase();
  }

  /**
   * Get cached explanation if available and not expired
   */
  get(word: string, language: string, verse: string): WordExplanationResponse | null {
    const key = this.generateKey(word, language, verse);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    console.log(`✅ Cache hit: "${word}"`);
    return { ...entry.data, cached: true };
  }

  /**
   * Store explanation in cache
   */
  set(word: string, language: string, verse: string, data: WordExplanationResponse): void {
    const key = this.generateKey(word, language, verse);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
    console.log(`💾 Cached: "${word}"`);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
export const wordCache = new WordExplanationCache();
