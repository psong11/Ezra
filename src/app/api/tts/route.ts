import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getGoogleTTSClient } from '@/lib/tts/google';
import { getTTSCache } from '@/lib/tts/cache';
import { generateCacheKey, getAudioExtension, getAudioMimeType } from '@/lib/tts/hash';
import { isSSML } from '@/lib/tts/chunking';

/**
 * Request schema validation with Zod
 */
const TTSRequestSchema = z.object({
  text: z.string().optional(),
  ssml: z.string().optional(),
  voiceName: z.string().optional(),
  languageCode: z.string().default('en-US'),
  audioEncoding: z.enum(['MP3', 'OGG_OPUS', 'LINEAR16']).default('MP3'),
  speakingRate: z.number().min(0.25).max(4.0).default(1.0),
  pitch: z.number().min(-20.0).max(20.0).default(0.0),
  volumeGainDb: z.number().min(-96.0).max(16.0).default(0.0),
}).refine(
  (data: { text?: string; ssml?: string }): boolean => !!(data.text || data.ssml),
  { message: 'Either text or ssml must be provided' }
);

export type TTSRequest = z.infer<typeof TTSRequestSchema>;

/**
 * POST /api/tts
 * Synthesize text to speech with caching
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = TTSRequestSchema.parse(body);

    const {
      text,
      ssml,
      voiceName,
      languageCode,
      audioEncoding,
      speakingRate,
      pitch,
      volumeGainDb,
    } = validatedData;

    // Determine input text (auto-detect SSML)
    let inputText: string;
    let useSSML: boolean;

    if (ssml) {
      inputText = ssml;
      useSSML = true;
    } else if (text) {
      inputText = text;
      useSSML = isSSML(text);
    } else {
      return NextResponse.json(
        { error: 'Either text or ssml must be provided' },
        { status: 400 }
      );
    }

    // Validate text length
    if (inputText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text cannot be empty' },
        { status: 400 }
      );
    }

    // Generate cache key
    const cacheKey = generateCacheKey({
      text: inputText,
      voiceName,
      languageCode,
      audioEncoding,
      speakingRate,
      pitch,
      volumeGainDb,
    });

    const extension = getAudioExtension(audioEncoding);
    const mimeType = getAudioMimeType(audioEncoding);

    // Check cache
    const cache = await getTTSCache();
    const cached = await cache.has(cacheKey, extension);

    let audioBuffer: Buffer;

    if (cached) {
      console.log('✅ Cache hit:', cacheKey);
      const cachedBuffer = await cache.get(cacheKey, extension);
      
      if (cachedBuffer) {
        audioBuffer = cachedBuffer;
      } else {
        // Cache miss even though has() returned true - synthesize
        console.warn('⚠️  Cache file missing, synthesizing...');
        audioBuffer = await synthesizeAudio(validatedData, inputText, useSSML);
        await cache.set(cacheKey, extension, audioBuffer, mimeType);
      }
    } else {
      console.log('🎤 Cache miss, synthesizing:', cacheKey);
      
      // Synthesize audio
      audioBuffer = await synthesizeAudio(validatedData, inputText, useSSML);
      
      // Store in cache
      await cache.set(cacheKey, extension, audioBuffer, mimeType);
    }

    // Return audio with proper headers
    return new NextResponse(audioBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Cache-Key': cacheKey,
        'X-Cache-Hit': cached ? 'true' : 'false',
      },
    });
  } catch (error: any) {
    console.error('TTS API error:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle Google API errors
    if (error.code === 3 || error.code === 'INVALID_ARGUMENT') {
      return NextResponse.json(
        {
          error: 'Invalid request parameters',
          message: error.message,
        },
        { status: 400 }
      );
    }

    if (error.code === 429 || error.code === 'RESOURCE_EXHAUSTED') {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
        },
        { status: 429 }
      );
    }

    // Check if it's an authentication error
    const isAuthError = error.message?.includes('credentials') || error.message?.includes('authentication');

    // Generic error
    return NextResponse.json(
      {
        error: isAuthError ? 'Authentication required' : 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
        authRequired: isAuthError,
        helpUrl: isAuthError ? 'https://cloud.google.com/docs/authentication/getting-started' : undefined,
      },
      { status: isAuthError ? 401 : 500 }
    );
  }
}

/**
 * Helper to synthesize audio
 */
async function synthesizeAudio(
  params: TTSRequest,
  inputText: string,
  useSSML: boolean
): Promise<Buffer> {
  const client = getGoogleTTSClient();

  const synthesisParams = {
    ...(useSSML ? { ssml: inputText } : { text: inputText }),
    voiceName: params.voiceName,
    languageCode: params.languageCode,
    audioEncoding: params.audioEncoding,
    speakingRate: params.speakingRate,
    pitch: params.pitch,
    volumeGainDb: params.volumeGainDb,
  };

  return await client.synthesize(synthesisParams);
}
