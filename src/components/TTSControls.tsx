'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTTS } from '@/hooks/useTTS';
import { VoiceInfo } from '@/lib/tts/client';

interface TTSControlsProps {
  text: string;
  languageCode?: string;
  onError?: (error: Error) => void;
}

interface TTSSettings {
  voiceName: string;
  speakingRate: number;
  pitch: number;
}

const DEFAULT_SETTINGS: TTSSettings = {
  voiceName: '',
  speakingRate: 1.0,
  pitch: 0.0,
};

/**
 * Load settings from localStorage
 */
function loadSettings(): TTSSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  
  try {
    const stored = localStorage.getItem('ezra-tts-settings');
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load TTS settings:', error);
  }
  
  return DEFAULT_SETTINGS;
}

/**
 * Save settings to localStorage
 */
function saveSettings(settings: TTSSettings): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('ezra-tts-settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save TTS settings:', error);
  }
}

/**
 * TTS Controls Component
 */
export function TTSControls({ text, languageCode, onError }: TTSControlsProps) {
  const [settings, setSettings] = useState<TTSSettings>(DEFAULT_SETTINGS);
  const [filteredVoices, setFilteredVoices] = useState<VoiceInfo[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    isLoading,
    isPlaying,
    error,
    voices,
    voicesLoading,
    speak,
    stop,
    pause,
    resume,
    audioRef,
  } = useTTS({
    onError,
  });

  // Load settings on mount
  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  // Filter voices by language code
  useEffect(() => {
    if (voices.length === 0) return;

    if (languageCode) {
      const langCode = languageCode.split('-')[0].toLowerCase(); // Get base language (e.g., 'en' from 'en-US')
      const filtered = voices.filter(v => 
        v.languageCode.toLowerCase().startsWith(langCode)
      );
      setFilteredVoices(filtered);

      // Auto-select first matching voice if not set or current voice doesn't match language
      const currentVoice = voices.find(v => v.name === settings.voiceName);
      const needsNewVoice = !settings.voiceName || 
        (currentVoice && !currentVoice.languageCode.toLowerCase().startsWith(langCode));
      
      if (needsNewVoice && filtered.length > 0) {
        setSettings(prev => ({ ...prev, voiceName: filtered[0].name }));
      }
    } else {
      setFilteredVoices(voices);
    }
  }, [voices, languageCode, settings.voiceName]);

  // Update settings and save to localStorage
  const updateSettings = useCallback((updates: Partial<TTSSettings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  // Handle speak button click
  const handleSpeak = useCallback(async () => {
    if (isPlaying) {
      stop();
      return;
    }

    try {
      // If a specific voice is selected, use its language code
      // Otherwise, use the provided language code or default to en-US
      let effectiveLanguageCode = languageCode || 'en-US';
      
      if (settings.voiceName) {
        const selectedVoice = voices.find(v => v.name === settings.voiceName);
        if (selectedVoice) {
          effectiveLanguageCode = selectedVoice.languageCode;
        }
      }

      await speak({
        text,
        voiceName: settings.voiceName || undefined,
        languageCode: effectiveLanguageCode,
        audioEncoding: 'MP3',
        speakingRate: settings.speakingRate,
        pitch: settings.pitch,
      });
    } catch (err) {
      console.error('TTS error:', err);
    }
  }, [isPlaying, stop, speak, text, settings, languageCode, voices]);

  // Keyboard shortcut (S key)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check if user is not typing in an input/textarea
      if (
        e.key.toLowerCase() === 's' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        handleSpeak();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleSpeak]);

  // Check prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Check if error is authentication-related
  const isAuthError = error?.message?.includes('authentication') || error?.message?.includes('credentials');

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
      {/* Authentication Error Banner */}
      {isAuthError && (
        <div className="mb-4 p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-200 mb-1">Google Cloud Setup Required</h4>
              <p className="text-sm text-yellow-100/90 mb-2">
                To use Text-to-Speech, you need to authenticate with Google Cloud.
              </p>
              <div className="text-xs text-yellow-100/80 space-y-1">
                <p><strong>Quick setup:</strong> Run this in your terminal:</p>
                <code className="block bg-black/30 p-2 rounded mt-1 font-mono">
                  gcloud auth application-default login
                </code>
                <p className="mt-2">
                  <a 
                    href="https://cloud.google.com/docs/authentication/getting-started" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-yellow-300 hover:text-yellow-200 underline"
                  >
                    View full setup guide →
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828 2.828" />
          </svg>
          Text-to-Speech
          <span className="text-xs text-gray-400 font-normal">(Press S)</span>
        </h3>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
          aria-label={isExpanded ? 'Collapse settings' : 'Expand settings'}
          aria-expanded={isExpanded}
        >
          <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Main Controls */}
      <div className="flex items-center gap-3">
        {/* Play/Stop Button */}
        <button
          onClick={handleSpeak}
          disabled={isLoading || !text}
          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed ${
            isPlaying
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
          }`}
          aria-label={isPlaying ? 'Stop' : 'Speak'}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          ) : isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Pause/Resume (only shown when playing) */}
        {isPlaying && (
          <button
            onClick={isPlaying ? pause : resume}
            className="p-2 text-gray-400 hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Pause"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}

        {/* Voice Selector */}
        <select
          value={settings.voiceName}
          onChange={(e) => updateSettings({ voiceName: e.target.value })}
          disabled={voicesLoading || filteredVoices.length === 0}
          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          aria-label="Select voice"
        >
          <option value="">
            {voicesLoading ? 'Loading voices...' : 'Default voice'}
          </option>
          {filteredVoices.map(voice => (
            <option key={voice.name} value={voice.name}>
              {voice.name} ({voice.ssmlGender})
            </option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded text-sm text-red-300" role="alert">
          {error.message}
        </div>
      )}

      {/* Advanced Settings */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-700 space-y-4" {...(prefersReducedMotion ? {} : { 'aria-live': 'polite' })}>
          {/* Speaking Rate */}
          <div>
            <label htmlFor="speaking-rate" className="block text-sm text-gray-300 mb-2">
              Speaking Rate: {settings.speakingRate.toFixed(2)}x
            </label>
            <input
              id="speaking-rate"
              type="range"
              min="0.25"
              max="4.0"
              step="0.05"
              value={settings.speakingRate}
              onChange={(e) => updateSettings({ speakingRate: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              aria-label="Speaking rate"
              aria-valuemin={0.25}
              aria-valuemax={4.0}
              aria-valuenow={settings.speakingRate}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Slower</span>
              <span>Normal</span>
              <span>Faster</span>
            </div>
          </div>

          {/* Pitch */}
          <div>
            <label htmlFor="pitch" className="block text-sm text-gray-300 mb-2">
              Pitch: {settings.pitch > 0 ? '+' : ''}{settings.pitch.toFixed(1)}
            </label>
            <input
              id="pitch"
              type="range"
              min="-20"
              max="20"
              step="0.5"
              value={settings.pitch}
              onChange={(e) => updateSettings({ pitch: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              aria-label="Pitch"
              aria-valuemin={-20}
              aria-valuemax={20}
              aria-valuenow={settings.pitch}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Lower</span>
              <span>Normal</span>
              <span>Higher</span>
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => updateSettings(DEFAULT_SETTINGS)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
          >
            Reset to defaults
          </button>
        </div>
      )}

      {/* Hidden audio element */}
      <audio ref={audioRef} className="hidden" />

      {/* CSS for custom slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
        
        .slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
        }
        
        .slider:focus::-moz-range-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
}
