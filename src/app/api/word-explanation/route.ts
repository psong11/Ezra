import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getWordExplanation } from '@/lib/openai/wordExplanation';
import { wordCache } from '@/lib/cache/wordCache';
import { WordExplanationRequest } from '@/lib/openai/types';

/**
 * Request schema validation
 */
const WordExplanationRequestSchema = z.object({
  word: z.string().min(1, 'Word is required'),
  language: z.string().default('Hebrew'),
  verse: z.string().min(1, 'Verse context is required'),
  bookName: z.string().optional(),
  chapterNum: z.number().optional(),
  verseNum: z.number().optional(),
});

/**
 * POST /api/word-explanation
 * Get linguistic explanation for a Biblical word
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json();
    const validatedData = WordExplanationRequestSchema.parse(body);

    const { word, language, verse, bookName, chapterNum, verseNum } = validatedData;

    // Check cache first
    const cached = wordCache.get(word, language, verse);
    if (cached) {
      return NextResponse.json(cached, { status: 200 });
    }

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: 'OpenAI API key not configured',
          message: 'Please set OPENAI_API_KEY environment variable',
        },
        { status: 503 }
      );
    }

    // Call OpenAI API
    const requestData: WordExplanationRequest = {
      word,
      language,
      verse,
      bookName,
      chapterNum,
      verseNum,
    };

    const explanation = await getWordExplanation(requestData);

    // Cache the result
    wordCache.set(word, language, verse, explanation);

    return NextResponse.json(explanation, { status: 200 });
  } catch (error: any) {
    console.error('Word explanation API error:', error);

    // Zod validation error
    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // OpenAI API error
    if (error.message?.includes('OpenAI')) {
      return NextResponse.json(
        {
          error: 'AI service error',
          message: error.message,
        },
        { status: 502 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/word-explanation/stats
 * Get cache statistics (for debugging)
 */
export async function GET(request: NextRequest) {
  const stats = wordCache.getStats();
  return NextResponse.json(stats, { status: 200 });
}
