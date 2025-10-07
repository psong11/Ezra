import crypto from 'crypto';

/**
 * Generate a deterministic hash for TTS cache key
 * Based on all parameters that affect the audio output
 */
export function generateCacheKey(params: {
  text: string;
  voiceName?: string;
  languageCode?: string;
  audioEncoding?: string;
  speakingRate?: number;
  pitch?: number;
  volumeGainDb?: number;
  model?: string;
}): string {
  const {
    text,
    voiceName = '',
    languageCode = '',
    audioEncoding = 'MP3',
    speakingRate = 1.0,
    pitch = 0.0,
    volumeGainDb = 0.0,
    model = '',
  } = params;

  // Create deterministic string from all parameters
  const keyString = [
    text,
    voiceName,
    languageCode,
    audioEncoding,
    speakingRate.toFixed(2),
    pitch.toFixed(2),
    volumeGainDb.toFixed(2),
    model,
  ].join('|');

  // Generate SHA-256 hash
  return crypto
    .createHash('sha256')
    .update(keyString)
    .digest('hex');
}

/**
 * Get file extension for audio encoding
 */
export function getAudioExtension(encoding: string): string {
  const extensions: Record<string, string> = {
    MP3: 'mp3',
    OGG_OPUS: 'ogg',
    LINEAR16: 'wav',
    MULAW: 'wav',
    ALAW: 'wav',
  };
  
  return extensions[encoding] || 'mp3';
}

/**
 * Get MIME type for audio encoding
 */
export function getAudioMimeType(encoding: string): string {
  const mimeTypes: Record<string, string> = {
    MP3: 'audio/mpeg',
    OGG_OPUS: 'audio/ogg',
    LINEAR16: 'audio/wav',
    MULAW: 'audio/wav',
    ALAW: 'audio/wav',
  };
  
  return mimeTypes[encoding] || 'audio/mpeg';
}
