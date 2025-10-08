/**
 * Split text into chunks at sentence boundaries
 * Google TTS has a hard limit of 5000 BYTES (not characters)
 * Hebrew characters are 2-3 bytes each in UTF-8
 */
export const MAX_CHUNK_BYTES = 4500; // Use 4500 to be safe (leave buffer for request overhead)

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
 * Get byte length of a string in UTF-8
 */
function getByteLength(text: string): number {
  return Buffer.byteLength(text, 'utf8');
}

/**
 * Split text into chunks suitable for Google TTS
 * Preserves sentence boundaries and handles SSML
 * Uses BYTE length (not character length) to comply with Google's 5000 byte limit
 */
export function chunkText(text: string, maxBytes: number = MAX_CHUNK_BYTES): string[] {
  const textBytes = getByteLength(text);
  
  if (textBytes <= maxBytes) {
    return [text];
  }

  console.log(`📝 Text is ${textBytes} bytes, chunking into ${maxBytes}-byte segments...`);

  // For SSML, don't chunk - let the caller handle it
  if (isSSML(text)) {
    console.warn('SSML text exceeds max length. Consider simplifying SSML markup.');
    return [text];
  }

  const sentences = splitIntoSentences(text);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const sentenceBytes = getByteLength(sentence);
    
    // If single sentence is too long, split it by words
    if (sentenceBytes > maxBytes) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      
      // Split long sentence by words
      const words = sentence.split(/\s+/);
      for (const word of words) {
        const testChunk = currentChunk + (currentChunk ? ' ' : '') + word;
        if (getByteLength(testChunk) > maxBytes) {
          if (currentChunk) {
            chunks.push(currentChunk.trim());
          }
          currentChunk = word;
        } else {
          currentChunk = testChunk;
        }
      }
      continue;
    }

    // Check if adding this sentence would exceed byte limit
    const testChunk = currentChunk + (currentChunk ? ' ' : '') + sentence;
    if (getByteLength(testChunk) > maxBytes) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
    } else {
      currentChunk = testChunk;
    }
  }

  // Add final chunk
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  const finalChunks = chunks.length > 0 ? chunks : [text];
  console.log(`✅ Split into ${finalChunks.length} chunks`);
  finalChunks.forEach((chunk, i) => {
    console.log(`   Chunk ${i + 1}: ${getByteLength(chunk)} bytes`);
  });
  
  return finalChunks;
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
