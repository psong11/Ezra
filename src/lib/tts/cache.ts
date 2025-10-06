import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

/**
 * Simple LRU cache implementation
 */
class LRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;

  constructor(maxSize: number = 200) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    // Remove if exists (to re-add at end)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    this.cache.set(key, value);

    // Evict oldest if over capacity
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Metadata stored in LRU cache
 */
interface CacheMetadata {
  hash: string;
  extension: string;
  mimeType: string;
  size: number;
  createdAt: number;
}

/**
 * TTS Cache Manager
 * Handles both disk caching and in-memory LRU cache
 */
export class TTSCache {
  private lruCache: LRUCache<string, CacheMetadata>;
  private cacheDir: string;

  constructor(cacheDir: string = 'public/tts-cache', lruSize: number = 200) {
    this.lruCache = new LRUCache<string, CacheMetadata>(lruSize);
    this.cacheDir = cacheDir;
  }

  /**
   * Initialize cache directory
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create cache directory:', error);
      throw error;
    }
  }

  /**
   * Get cache file path
   */
  getCachePath(hash: string, extension: string): string {
    return path.join(this.cacheDir, `${hash}.${extension}`);
  }

  /**
   * Get public URL for cached file
   */
  getPublicUrl(hash: string, extension: string): string {
    // Convert public/tts-cache to /tts-cache for browser
    return `/tts-cache/${hash}.${extension}`;
  }

  /**
   * Check if audio is cached
   */
  async has(hash: string, extension: string): Promise<boolean> {
    // Check LRU cache first
    if (this.lruCache.has(hash)) {
      return true;
    }

    // Check disk
    const filePath = this.getCachePath(hash, extension);
    const exists = existsSync(filePath);

    // If exists on disk but not in LRU, add to LRU
    if (exists) {
      try {
        const stats = await fs.stat(filePath);
        this.lruCache.set(hash, {
          hash,
          extension,
          mimeType: '', // Will be set when retrieved
          size: stats.size,
          createdAt: stats.birthtimeMs,
        });
      } catch (error) {
        console.error('Failed to stat cache file:', error);
      }
    }

    return exists;
  }

  /**
   * Get cached audio buffer
   */
  async get(hash: string, extension: string): Promise<Buffer | null> {
    const filePath = this.getCachePath(hash, extension);
    
    try {
      const buffer = await fs.readFile(filePath);
      return buffer;
    } catch (error) {
      // File doesn't exist or read error
      return null;
    }
  }

  /**
   * Store audio in cache
   */
  async set(
    hash: string,
    extension: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<void> {
    const filePath = this.getCachePath(hash, extension);

    try {
      await fs.writeFile(filePath, buffer);

      // Update LRU cache
      this.lruCache.set(hash, {
        hash,
        extension,
        mimeType,
        size: buffer.length,
        createdAt: Date.now(),
      });
    } catch (error) {
      console.error('Failed to write cache file:', error);
      throw error;
    }
  }

  /**
   * Get cache metadata
   */
  getMetadata(hash: string): CacheMetadata | undefined {
    return this.lruCache.get(hash);
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.lruCache.clear();

    try {
      const files = await fs.readdir(this.cacheDir);
      await Promise.all(
        files.map(file => fs.unlink(path.join(this.cacheDir, file)))
      );
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    lruSize: number;
    diskFiles: number;
    totalSize: number;
  }> {
    let diskFiles = 0;
    let totalSize = 0;

    try {
      const files = await fs.readdir(this.cacheDir);
      diskFiles = files.length;

      const stats = await Promise.all(
        files.map(file => fs.stat(path.join(this.cacheDir, file)))
      );
      totalSize = stats.reduce((sum, stat) => sum + stat.size, 0);
    } catch (error) {
      console.error('Failed to get cache stats:', error);
    }

    return {
      lruSize: this.lruCache.size(),
      diskFiles,
      totalSize,
    };
  }
}

// Singleton instance
let cacheInstance: TTSCache | null = null;

/**
 * Get or create cache instance
 */
export async function getTTSCache(): Promise<TTSCache> {
  if (!cacheInstance) {
    cacheInstance = new TTSCache();
    await cacheInstance.initialize();
  }
  return cacheInstance;
}
