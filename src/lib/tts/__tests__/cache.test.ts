import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TTSCache } from '../cache';
import fs from 'fs/promises';
import path from 'path';

describe('TTS Cache', () => {
  const testCacheDir = path.join(process.cwd(), 'test-cache');
  let cache: TTSCache;

  beforeEach(async () => {
    cache = new TTSCache(testCacheDir, 5);
    await cache.initialize();
  });

  afterEach(async () => {
    // Clean up test cache
    try {
      await cache.clear();
      await fs.rmdir(testCacheDir);
    } catch (error) {
      // Ignore errors
    }
  });

  describe('LRU Cache', () => {
    it('should store and retrieve from LRU cache', async () => {
      const hash = 'test123';
      const extension = 'mp3';
      const buffer = Buffer.from('test audio data');
      const mimeType = 'audio/mpeg';

      await cache.set(hash, extension, buffer, mimeType);
      const metadata = cache.getMetadata(hash);

      expect(metadata).toBeDefined();
      expect(metadata?.hash).toBe(hash);
      expect(metadata?.extension).toBe(extension);
    });

    it('should evict oldest items when cache is full', async () => {
      // Fill cache beyond capacity (5 items)
      for (let i = 0; i < 7; i++) {
        await cache.set(
          `hash${i}`,
          'mp3',
          Buffer.from(`data${i}`),
          'audio/mpeg'
        );
      }

      // First two items should be evicted
      expect(cache.getMetadata('hash0')).toBeUndefined();
      expect(cache.getMetadata('hash1')).toBeUndefined();
      
      // Last 5 items should still be in cache
      expect(cache.getMetadata('hash6')).toBeDefined();
    });
  });

  describe('Disk Cache', () => {
    it('should write and read from disk', async () => {
      const hash = 'disktest';
      const extension = 'mp3';
      const buffer = Buffer.from('disk audio data');
      const mimeType = 'audio/mpeg';

      await cache.set(hash, extension, buffer, mimeType);
      
      const has = await cache.has(hash, extension);
      expect(has).toBe(true);

      const retrieved = await cache.get(hash, extension);
      expect(retrieved).toEqual(buffer);
    });

    it('should return null for non-existent file', async () => {
      const result = await cache.get('nonexistent', 'mp3');
      expect(result).toBeNull();
    });

    it('should generate correct cache path', () => {
      const path = cache.getCachePath('abc123', 'mp3');
      expect(path).toContain('abc123.mp3');
    });

    it('should generate correct public URL', () => {
      const url = cache.getPublicUrl('abc123', 'mp3');
      expect(url).toBe('/tts-cache/abc123.mp3');
    });
  });

  describe('Cache Statistics', () => {
    it('should provide accurate statistics', async () => {
      await cache.set('stat1', 'mp3', Buffer.from('a'.repeat(100)), 'audio/mpeg');
      await cache.set('stat2', 'mp3', Buffer.from('b'.repeat(200)), 'audio/mpeg');

      const stats = await cache.getStats();
      
      expect(stats.lruSize).toBe(2);
      expect(stats.diskFiles).toBe(2);
      expect(stats.totalSize).toBe(300);
    });
  });
});
