'use client';

/**
 * Chapter Reader Component
 * Client-side component for displaying verses and providing TTS functionality
 */

import { useState, useRef } from 'react';
import { BibleBookData, BibleChapter } from '@/types/bible';
import { prepareHebrewForTTS } from '@/lib/hebrewText';

interface Props {
  bookData: BibleBookData;
  bookName: string;
  hebrewName: string;
  chapterNum: number;
  chapterData: BibleChapter;
}

export default function ChapterReader({
  bookData,
  bookName,
  hebrewName,
  chapterNum,
  chapterData,
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Get full chapter text for TTS (with cantillation marks removed)
  const getChapterText = () => {
    const fullText = chapterData.verses.map(v => v.text).join(' ');
    return prepareHebrewForTTS(fullText);
  };

  // Generate speech for entire chapter
  const handleGenerateSpeech = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const text = getChapterText();
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          languageCode: 'he-IL',
          voiceName: 'he-IL-Wavenet-A',
          // Don't send model parameter - it's implied in the voice name
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      // Auto-play with selected playback rate
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.play();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate speech');
      console.error('TTS Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate speech for a single verse
  const handleGenerateVerseSpeech = async (verseNum: number) => {
    setIsGenerating(true);
    setError(null);
    setSelectedVerse(verseNum);

    try {
      const verse = chapterData.verses.find(v => v.verse === verseNum);
      if (!verse) throw new Error('Verse not found');

      // Remove cantillation marks for better TTS quality
      const cleanedText = prepareHebrewForTTS(verse.text);

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanedText,
          languageCode: 'he-IL',
          voiceName: 'he-IL-Wavenet-A',
          // Don't send model parameter - it's implied in the voice name
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      // Auto-play with selected playback rate
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.play();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate speech');
      console.error('TTS Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Update playback rate when changed
  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  return (
    <div className="space-y-6">
      {/* TTS Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Audio Controls
        </h3>
        
        <div className="space-y-4">
          {/* Playback Speed Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Playback Speed
            </label>
            <div className="flex gap-2">
              {[0.75, 1.0, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handlePlaybackRateChange(rate)}
                  className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                    playbackRate === rate
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateSpeech}
            disabled={isGenerating}
            className="w-full px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {isGenerating ? '🔄 Generating...' : '🔊 Listen to Full Chapter'}
          </button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {audioUrl && (
            <div className="space-y-2">
              <audio
                ref={audioRef}
                controls
                className="w-full"
                onEnded={() => setAudioUrl(null)}
              >
                <source src={audioUrl} type="audio/mpeg" />
              </audio>
              <p className="text-sm text-gray-500 text-center">
                Click on individual verses to hear them separately
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chapter Text - Verse by Verse */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="space-y-4">
          {chapterData.verses.map((verse) => (
            <div
              key={verse.verse}
              className={`flex gap-4 p-4 rounded-lg transition-all ${
                selectedVerse === verse.verse
                  ? 'bg-amber-50 border-2 border-amber-300'
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
            >
              {/* Verse Number */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => handleGenerateVerseSpeech(verse.verse)}
                  disabled={isGenerating}
                  className="w-10 h-10 flex items-center justify-center bg-amber-100 text-amber-700 rounded-full font-bold hover:bg-amber-200 transition-colors disabled:opacity-50"
                  title="Click to hear this verse"
                >
                  {verse.verse}
                </button>
              </div>

              {/* Verse Text */}
              <div className="flex-1">
                <p
                  dir="rtl"
                  lang="he"
                  className="text-xl leading-relaxed text-gray-800"
                >
                  {verse.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chapter Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-amber-600">
              {chapterData.verses.length}
            </div>
            <div className="text-sm text-gray-600">Verses</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-amber-600">
              {chapterData.verses.reduce((sum, v) => sum + (v.words?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Words</div>
          </div>
        </div>
      </div>
    </div>
  );
}
