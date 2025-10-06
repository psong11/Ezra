import { NextResponse } from 'next/server';
import { getGoogleTTSClient } from '@/lib/tts/google';

/**
 * Voice response format
 */
interface VoiceInfo {
  name: string;
  languageCode: string;
  ssmlGender: string;
  naturalSampleRateHertz: number;
}

/**
 * GET /api/voices
 * List all available TTS voices with caching
 */
export async function GET() {
  try {
    const client = getGoogleTTSClient();
    const voices = await client.listVoices();

    // Transform to simplified format
    const voiceList: VoiceInfo[] = voices
      .filter(voice => voice.name && voice.languageCodes && voice.languageCodes.length > 0)
      .map(voice => ({
        name: voice.name || '',
        languageCode: voice.languageCodes?.[0] || '',
        ssmlGender: String(voice.ssmlGender || 'NEUTRAL'),
        naturalSampleRateHertz: voice.naturalSampleRateHertz || 24000,
      }))
      .sort((a, b) => {
        // Sort by language code, then by name
        const langCompare = a.languageCode.localeCompare(b.languageCode);
        return langCompare !== 0 ? langCompare : a.name.localeCompare(b.name);
      });

    return NextResponse.json(
      {
        voices: voiceList,
        count: voiceList.length,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      }
    );
  } catch (error: any) {
    console.error('Voices API error:', error);

    // Check if it's an authentication error
    const isAuthError = error.message?.includes('credentials') || error.message?.includes('authentication');

    return NextResponse.json(
      {
        error: 'Failed to fetch voices',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
        authRequired: isAuthError,
        helpUrl: isAuthError ? 'https://cloud.google.com/docs/authentication/getting-started' : undefined,
      },
      { status: isAuthError ? 401 : 500 }
    );
  }
}
