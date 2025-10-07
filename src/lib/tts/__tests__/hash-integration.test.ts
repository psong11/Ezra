/**
 * Integration tests for TTS hash generation
 * Tests that hash generation is deterministic and changes appropriately
 */

import { describe, it, expect } from 'vitest';
import { generateCacheKey, getAudioExtension, getAudioMimeType } from '../hash';

describe('generateCacheKey', () => {
  it('should generate consistent hash for same parameters', () => {
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

  it('should generate different hash for different text', () => {
    const params1 = { text: 'Hello world' };
    const params2 = { text: 'Goodbye world' };

    const hash1 = generateCacheKey(params1);
    const hash2 = generateCacheKey(params2);

    expect(hash1).not.toBe(hash2);
  });

  it('should generate different hash for different voice', () => {
    const params1 = { text: 'Hello', voiceName: 'en-US-Standard-A' };
    const params2 = { text: 'Hello', voiceName: 'en-US-Standard-B' };

    const hash1 = generateCacheKey(params1);
    const hash2 = generateCacheKey(params2);

    expect(hash1).not.toBe(hash2);
  });

  it('should generate different hash for different audio encoding', () => {
    const params1 = { text: 'Hello', audioEncoding: 'MP3' };
    const params2 = { text: 'Hello', audioEncoding: 'OGG_OPUS' };

    const hash1 = generateCacheKey(params1);
    const hash2 = generateCacheKey(params2);

    expect(hash1).not.toBe(hash2);
  });

  it('should generate different hash for different speaking rate', () => {
    const params1 = { text: 'Hello', speakingRate: 1.0 };
    const params2 = { text: 'Hello', speakingRate: 1.5 };

    const hash1 = generateCacheKey(params1);
    const hash2 = generateCacheKey(params2);

    expect(hash1).not.toBe(hash2);
  });

  it('should generate different hash for different pitch', () => {
    const params1 = { text: 'Hello', pitch: 0.0 };
    const params2 = { text: 'Hello', pitch: 2.0 };

    const hash1 = generateCacheKey(params1);
    const hash2 = generateCacheKey(params2);

    expect(hash1).not.toBe(hash2);
  });

  it('should generate different hash for different volume', () => {
    const params1 = { text: 'Hello', volumeGainDb: 0.0 };
    const params2 = { text: 'Hello', volumeGainDb: -5.0 };

    const hash1 = generateCacheKey(params1);
    const hash2 = generateCacheKey(params2);

    expect(hash1).not.toBe(hash2);
  });

  it('should generate different hash when model parameter changes', () => {
    const params1 = { text: 'Hello', model: undefined };
    const params2 = { text: 'Hello', model: 'journey' };

    const hash1 = generateCacheKey(params1);
    const hash2 = generateCacheKey(params2);

    expect(hash1).not.toBe(hash2);
  });

  it('should handle default values correctly', () => {
    const params1 = {
      text: 'Hello',
      audioEncoding: 'MP3',
      speakingRate: 1.0,
      pitch: 0.0,
      volumeGainDb: 0.0,
    };

    const params2 = { text: 'Hello' };

    const hash1 = generateCacheKey(params1);
    const hash2 = generateCacheKey(params2);

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

  it('should return default mp3 for unknown encoding', () => {
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

  it('should return default audio/mpeg for unknown encoding', () => {
    expect(getAudioMimeType('UNKNOWN')).toBe('audio/mpeg');
  });
});
