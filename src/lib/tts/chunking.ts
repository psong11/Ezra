/**
 * Split text into chunks at sentence boundaries
 * Google TTS has a soft limit of ~5000 characters
 */
export const MAX_CHUNK_LENGTH = 5000;

/**
 * Split text on sentence boundaries (. ! ? followed by space or newline)
 */
function splitIntoSentences(text: string): string[] {
  // Match sentence endings: . ! ? followed by space/newline or end of string
  const sentenceRegex = /[.!?]+[\s\n]+|[.!?]+$/g;
  const sentences: string[] = [];
  let lastIndex = 0;
  let match;

  while ((match = sentenceRegex.exec(text)) !== null) {
    const sentence = text.slice(lastIndex, match.index + match[0].length).trim();
    if (sentence) {
      sentences.push(sentence);
    }
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text if any
  const remaining = text.slice(lastIndex).trim();
  if (remaining) {
    sentences.push(remaining);
  }

  return sentences.length > 0 ? sentences : [text];
}

/**
 * Check if text is SSML (starts with <speak> tag)
 */
export function isSSML(text: string): boolean {
  return text.trim().startsWith('<speak');
}

/**
 * Split text into chunks suitable for Google TTS
 * Preserves sentence boundaries and handles SSML
 */
export function chunkText(text: string, maxLength: number = MAX_CHUNK_LENGTH): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  // For SSML, don't chunk - let the caller handle it
  if (isSSML(text)) {
    console.warn('SSML text exceeds max length. Consider simplifying SSML markup.');
    return [text];
  }

  const sentences = splitIntoSentences(text);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    // If single sentence is too long, split it by words
    if (sentence.length > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      
      // Split long sentence by words
      const words = sentence.split(/\s+/);
      for (const word of words) {
        if (currentChunk.length + word.length + 1 > maxLength) {
          if (currentChunk) {
            chunks.push(currentChunk.trim());
          }
          currentChunk = word;
        } else {
          currentChunk += (currentChunk ? ' ' : '') + word;
        }
      }
      continue;
    }

    // Check if adding this sentence would exceed limit
    if (currentChunk.length + sentence.length + 1 > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }

  // Add final chunk
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}

/**
 * Concatenate multiple audio buffers
 * Note: This is a simple concatenation. For production, consider using
 * a library like ffmpeg-static for proper audio merging
 */
export function concatenateAudioBuffers(buffers: Buffer[]): Buffer {
  if (buffers.length === 0) {
    return Buffer.alloc(0);
  }
  
  if (buffers.length === 1) {
    return buffers[0];
  }

  return Buffer.concat(buffers);
}
