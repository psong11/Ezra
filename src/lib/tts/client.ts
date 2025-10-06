/**
 * Client-side TTS SDK
 */

export interface TTSOptions {
  text?: string;
  ssml?: string;
  voiceName?: string;
  languageCode?: string;
  audioEncoding?: 'MP3' | 'OGG_OPUS' | 'LINEAR16';
  speakingRate?: number;
  pitch?: number;
  volumeGainDb?: number;
}

export interface VoiceInfo {
  name: string;
  languageCode: string;
  ssmlGender: string;
  naturalSampleRateHertz: number;
}

export interface VoicesResponse {
  voices: VoiceInfo[];
  count: number;
}

/**
 * TTS Client for browser
 */
export class TTSClient {
  private baseUrl: string;
  private abortController: AbortController | null = null;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Synthesize speech and return audio Blob URL
   */
  async speak(options: TTSOptions): Promise<string> {
    // Cancel any existing request
    this.abort();

    // Create new abort controller
    this.abortController = new AbortController();

    try {
      const response = await fetch(`${this.baseUrl}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.message || 'Failed to synthesize speech');
      }

      // Get audio blob
      const blob = await response.blob();
      
      // Create blob URL
      const url = URL.createObjectURL(blob);
      
      return url;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      throw error;
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Abort current request
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Fetch available voices
   */
  async getVoices(): Promise<VoiceInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/voices`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch voices');
      }

      const data: VoicesResponse = await response.json();
      return data.voices;
    } catch (error) {
      console.error('Failed to fetch voices:', error);
      throw error;
    }
  }

  /**
   * Prefetch and cache audio for given options
   * Returns cache key for tracking
   */
  async prefetch(options: TTSOptions): Promise<void> {
    // Simply call speak and let browser cache handle it
    const url = await this.speak(options);
    
    // Immediately revoke to prevent memory leak
    // The browser will have cached the request
    URL.revokeObjectURL(url);
  }
}

// Default client instance
let defaultClient: TTSClient | null = null;

/**
 * Get or create default TTS client
 */
export function getTTSClient(): TTSClient {
  if (!defaultClient) {
    defaultClient = new TTSClient();
  }
  return defaultClient;
}
