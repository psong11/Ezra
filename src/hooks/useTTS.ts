'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TTSClient, TTSOptions, VoiceInfo } from '@/lib/tts/client';

interface UseTTSOptions {
  autoPlay?: boolean;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

interface UseTTSReturn {
  // State
  isLoading: boolean;
  isPlaying: boolean;
  error: Error | null;
  voices: VoiceInfo[];
  voicesLoading: boolean;
  
  // Methods
  speak: (options: TTSOptions) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  prefetch: (options: TTSOptions) => Promise<void>;
  
  // Audio element ref
  audioRef: React.RefObject<HTMLAudioElement>;
}

/**
 * React hook for Text-to-Speech
 */
export function useTTS(options: UseTTSOptions = {}): UseTTSReturn {
  const { autoPlay = true, onEnd, onError } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const clientRef = useRef<TTSClient>(new TTSClient());
  const currentBlobUrlRef = useRef<string | null>(null);

  // Load voices on mount
  useEffect(() => {
    let mounted = true;

    async function loadVoices() {
      if (voicesLoading || voices.length > 0) return;
      
      setVoicesLoading(true);
      try {
        const fetchedVoices = await clientRef.current.getVoices();
        if (mounted) {
          setVoices(fetchedVoices);
        }
      } catch (err: any) {
        console.error('Failed to load voices:', err);
        // If it's an auth error, set error state with helpful message
        if (mounted && err.message?.includes('Authentication required')) {
          setError(new Error('Google Cloud authentication required. Please set up credentials.'));
        }
      } finally {
        if (mounted) {
          setVoicesLoading(false);
        }
      }
    }

    loadVoices();

    return () => {
      mounted = false;
    };
  }, [voices.length, voicesLoading]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
      }
    };
  }, []);

  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnd) onEnd();
    };
    const handleError = (e: Event) => {
      const audioError = new Error('Audio playback error');
      setError(audioError);
      setIsPlaying(false);
      if (onError) onError(audioError);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [onEnd, onError]);

  /**
   * Speak text with given options
   */
  const speak = useCallback(async (ttsOptions: TTSOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      // Revoke previous blob URL
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
        currentBlobUrlRef.current = null;
      }

      // Get audio blob URL
      const blobUrl = await clientRef.current.speak(ttsOptions);
      currentBlobUrlRef.current = blobUrl;

      // Set audio source
      if (audioRef.current) {
        audioRef.current.src = blobUrl;
        
        if (autoPlay) {
          await audioRef.current.play();
        }
      }
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Failed to synthesize speech');
      setError(error);
      if (onError) onError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [autoPlay, onError]);

  /**
   * Stop playback and reset
   */
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    
    // Cancel any pending request
    clientRef.current.abort();
  }, []);

  /**
   * Pause playback
   */
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  /**
   * Resume playback
   */
  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  }, []);

  /**
   * Prefetch audio for given options
   */
  const prefetch = useCallback(async (ttsOptions: TTSOptions) => {
    try {
      await clientRef.current.prefetch(ttsOptions);
    } catch (err) {
      console.error('Prefetch failed:', err);
    }
  }, []);

  return {
    isLoading,
    isPlaying,
    error,
    voices,
    voicesLoading,
    speak,
    stop,
    pause,
    resume,
    prefetch,
    audioRef,
  };
}
