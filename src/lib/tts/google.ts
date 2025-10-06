import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech';
import { chunkText, concatenateAudioBuffers, isSSML } from './chunking';
import { env, isUsingServiceAccount } from '../env';

type ISynthesizeSpeechRequest = protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest;
type IVoice = protos.google.cloud.texttospeech.v1.IVoice;

/**
 * Synthesis parameters
 */
export interface SynthesisParams {
  text?: string;
  ssml?: string;
  voiceName?: string;
  languageCode?: string;
  audioEncoding?: 'MP3' | 'OGG_OPUS' | 'LINEAR16';
  speakingRate?: number;
  pitch?: number;
  volumeGainDb?: number;
}

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

/**
 * Sleep utility for retries
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(2, attempt);
  return Math.min(delay, config.maxDelay);
}

/**
 * Check if error is retryable (429 or 5xx)
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;
  
  const code = error.code || error.statusCode;
  
  // Retry on 429 (rate limit) and 5xx (server errors)
  return code === 429 || (code >= 500 && code < 600);
}

/**
 * Google Cloud TTS Client Wrapper
 */
export class GoogleTTSClient {
  private client: TextToSpeechClient;
  private retryConfig: RetryConfig;
  private voicesCache: IVoice[] | null = null;
  private voicesCacheTime: number = 0;
  private readonly VOICES_CACHE_TTL = 3600000; // 1 hour

  constructor(retryConfig: Partial<RetryConfig> = {}) {
    // Initialize client with ADC or service account
    const clientConfig: any = {};
    
    if (isUsingServiceAccount() && env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('🔑 Using service account from:', env.GOOGLE_APPLICATION_CREDENTIALS);
      clientConfig.keyFilename = env.GOOGLE_APPLICATION_CREDENTIALS;
    } else {
      console.log('🔑 Using Application Default Credentials (ADC)');
    }

    if (env.GOOGLE_CLOUD_PROJECT) {
      clientConfig.projectId = env.GOOGLE_CLOUD_PROJECT;
    }

    this.client = new TextToSpeechClient(clientConfig);
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  /**
   * List all available voices with caching
   */
  async listVoices(): Promise<IVoice[]> {
    const now = Date.now();
    
    // Return cached voices if still valid
    if (this.voicesCache && (now - this.voicesCacheTime) < this.VOICES_CACHE_TTL) {
      return this.voicesCache;
    }

    try {
      const [response] = await this.client.listVoices({});
      const voices = response.voices || [];
      this.voicesCache = voices;
      this.voicesCacheTime = now;
      
      console.log(`✅ Fetched ${voices.length} voices from Google TTS`);
      
      return voices;
    } catch (error) {
      console.error('Failed to list voices:', error);
      throw error;
    }
  }

  /**
   * Synthesize speech with automatic chunking and retry logic
   */
  async synthesize(params: SynthesisParams): Promise<Buffer> {
    const {
      text,
      ssml,
      voiceName,
      languageCode = 'en-US',
      audioEncoding = 'MP3',
      speakingRate = 1.0,
      pitch = 0.0,
      volumeGainDb = 0.0,
    } = params;

    // Validate input
    if (!text && !ssml) {
      throw new Error('Either text or ssml must be provided');
    }

    const inputText = text || ssml || '';
    const useSSML = ssml || isSSML(inputText);

    // Check if chunking is needed
    const chunks = chunkText(inputText);
    
    if (chunks.length === 1) {
      // Single request
      return this.synthesizeWithRetry({
        input: useSSML ? { ssml: inputText } : { text: inputText },
        voice: {
          languageCode,
          ...(voiceName && { name: voiceName }),
        },
        audioConfig: {
          audioEncoding: audioEncoding as any,
          speakingRate,
          pitch,
          volumeGainDb,
        },
      });
    }

    // Multiple chunks - synthesize sequentially and concatenate
    console.log(`📝 Chunking text into ${chunks.length} parts`);
    
    const audioBuffers: Buffer[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`🎤 Synthesizing chunk ${i + 1}/${chunks.length}`);
      
      const buffer = await this.synthesizeWithRetry({
        input: useSSML ? { ssml: chunk } : { text: chunk },
        voice: {
          languageCode,
          ...(voiceName && { name: voiceName }),
        },
        audioConfig: {
          audioEncoding: audioEncoding as any,
          speakingRate,
          pitch,
          volumeGainDb,
        },
      });
      
      audioBuffers.push(buffer);
    }

    return concatenateAudioBuffers(audioBuffers);
  }

  /**
   * Internal synthesis with retry logic
   */
  private async synthesizeWithRetry(
    request: ISynthesizeSpeechRequest,
    attempt: number = 0
  ): Promise<Buffer> {
    try {
      const [response] = await this.client.synthesizeSpeech(request);
      
      if (!response.audioContent) {
        throw new Error('No audio content in response');
      }

      // Convert Uint8Array to Buffer
      return Buffer.from(response.audioContent);
    } catch (error: any) {
      // Check if we should retry
      if (attempt < this.retryConfig.maxRetries && isRetryableError(error)) {
        const delay = getRetryDelay(attempt, this.retryConfig);
        console.warn(
          `⚠️  TTS request failed (attempt ${attempt + 1}/${this.retryConfig.maxRetries}). ` +
          `Retrying in ${delay}ms...`,
          error.message
        );
        
        await sleep(delay);
        return this.synthesizeWithRetry(request, attempt + 1);
      }

      // No more retries or non-retryable error
      console.error('❌ TTS synthesis failed:', error);
      throw error;
    }
  }

  /**
   * Get client instance (for testing)
   */
  getClient(): TextToSpeechClient {
    return this.client;
  }
}

// Singleton instance
let clientInstance: GoogleTTSClient | null = null;

/**
 * Get or create client instance
 */
export function getGoogleTTSClient(): GoogleTTSClient {
  if (!clientInstance) {
    clientInstance = new GoogleTTSClient();
  }
  return clientInstance;
}

/**
 * Reset client instance (for testing)
 */
export function resetGoogleTTSClient(): void {
  clientInstance = null;
}
