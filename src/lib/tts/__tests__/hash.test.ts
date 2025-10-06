import { describe, it, expect } from 'vitest';
import { generateCacheKey, getAudioExtension, getAudioMimeType } from '../hash';

describe('TTS Hash Utilities', () => {
  describe('generateCacheKey', () => {
    it('should generate consistent hash for same inputs', () => {
      const params = {
        text: 'Hello world',
        voiceName: 'en-US-Standard-A',
        languageCode: 'en-US',
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0.0,
        volumeGainDb: 0.0,
      };

      const hash1 = generateCacheKey(params);
      const hash2 = generateCacheKey(params);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 produces 64 hex characters
    });

    it('should generate different hashes for different texts', () => {
      const params1 = { text: 'Hello world' };
      const params2 = { text: 'Goodbye world' };

      const hash1 = generateCacheKey(params1);
      const hash2 = generateCacheKey(params2);

      expect(hash1).not.toBe(hash2);
    });

    it('should generate different hashes for different speaking rates', () => {
      const params1 = { text: 'Hello', speakingRate: 1.0 };
      const params2 = { text: 'Hello', speakingRate: 1.5 };

      const hash1 = generateCacheKey(params1);
      const hash2 = generateCacheKey(params2);

      expect(hash1).not.toBe(hash2);
    });

    it('should use defaults for missing parameters', () => {
      const hash1 = generateCacheKey({ text: 'Hello' });
      const hash2 = generateCacheKey({
        text: 'Hello',
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0.0,
        volumeGainDb: 0.0,
      });

      expect(hash1).toBe(hash2);
    });
  });

  describe('getAudioExtension', () => {
    it('should return correct extension for MP3', () => {
      expect(getAudioExtension('MP3')).toBe('mp3');
    });

    it('should return correct extension for OGG_OPUS', () => {
      expect(getAudioExtension('OGG_OPUS')).toBe('ogg');
    });

    it('should return correct extension for LINEAR16', () => {
      expect(getAudioExtension('LINEAR16')).toBe('wav');
    });

    it('should default to mp3 for unknown encoding', () => {
      expect(getAudioExtension('UNKNOWN')).toBe('mp3');
    });
  });

  describe('getAudioMimeType', () => {
    it('should return correct MIME type for MP3', () => {
      expect(getAudioMimeType('MP3')).toBe('audio/mpeg');
    });

    it('should return correct MIME type for OGG_OPUS', () => {
      expect(getAudioMimeType('OGG_OPUS')).toBe('audio/ogg');
    });

    it('should return correct MIME type for LINEAR16', () => {
      expect(getAudioMimeType('LINEAR16')).toBe('audio/wav');
    });

    it('should default to audio/mpeg for unknown encoding', () => {
      expect(getAudioMimeType('UNKNOWN')).toBe('audio/mpeg');
    });
  });
});
