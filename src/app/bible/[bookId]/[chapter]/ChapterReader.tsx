'use client';

/**
 * Chapter Reader Component
 * Client-side component for displaying verses and providing TTS functionality
 */

import { useState, useRef, useEffect } from 'react';
import { BibleBookData, BibleChapter } from '@/types/bible';
import { prepareHebrewForTTS } from '@/lib/hebrewText';
import WordTooltip from '@/components/bible/WordTooltip';

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
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [clickedWord, setClickedWord] = useState<{ verse: number; wordIndex: number; word: string } | null>(null);
  const [wordExplanation, setWordExplanation] = useState<string | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [explanationError, setExplanationError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Auto-play when audioUrl changes
  useEffect(() => {
    if (audioUrl && shouldAutoPlay && audioRef.current) {
      audioRef.current.load();
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.play().catch(err => {
        console.error('Auto-play failed:', err);
      });
      setShouldAutoPlay(false);
    }
  }, [audioUrl, shouldAutoPlay, playbackRate]);

  // Get full chapter text for TTS (with cantillation marks removed)
  const getChapterText = () => {
    const fullText = chapterData.verses.map(v => v.text).join(' ');
    return prepareHebrewForTTS(fullText);
  };

  // Get full chapter text as SSML with pauses between verses
  // Chunks SSML if needed to stay under 5000 byte limit
  const getChapterSSMLChunks = () => {
    const MAX_SSML_BYTES = 4500; // Leave buffer for SSML tags
    const chunks: string[] = [];
    let currentVerses: string[] = [];
    let currentBytes = 30; // Account for <speak></speak> tags
    
    for (const verse of chapterData.verses) {
      const cleanedText = prepareHebrewForTTS(verse.text);
      // Account for text + break tag (approximately 22 bytes)
      const verseBytes = Buffer.byteLength(cleanedText, 'utf8') + 22;
      
      if (currentBytes + verseBytes > MAX_SSML_BYTES && currentVerses.length > 0) {
        // Start new chunk
        const ssml = `<speak>${currentVerses.join('<break time="1s"/>')}</speak>`;
        chunks.push(ssml);
        currentVerses = [cleanedText];
        currentBytes = 30 + Buffer.byteLength(cleanedText, 'utf8');
      } else {
        currentVerses.push(cleanedText);
        currentBytes += verseBytes;
      }
    }
    
    // Add final chunk
    if (currentVerses.length > 0) {
      const ssml = `<speak>${currentVerses.join('<break time="1s"/>')}</speak>`;
      chunks.push(ssml);
    }
    
    return chunks;
  };

  // Generate speech for entire chapter
  const handleGenerateSpeech = async () => {
    // Stop current audio and clear URL
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setAudioUrl(null);
    
    setIsGenerating(true);
    setError(null);
    setShouldAutoPlay(true);

    try {
      const ssmlChunks = getChapterSSMLChunks();
      
      // If multiple chunks, fetch and concatenate
      if (ssmlChunks.length > 1) {
        console.log(`Fetching ${ssmlChunks.length} SSML chunks...`);
        const audioBuffers: ArrayBuffer[] = [];
        
        for (let i = 0; i < ssmlChunks.length; i++) {
          const response = await fetch('/api/tts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ssml: ssmlChunks[i],
              languageCode: 'he-IL',
              voiceName: 'he-IL-Wavenet-A',
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate speech');
          }

          const buffer = await response.arrayBuffer();
          audioBuffers.push(buffer);
        }
        
        // Concatenate all audio buffers
        const totalLength = audioBuffers.reduce((sum, buf) => sum + buf.byteLength, 0);
        const combined = new Uint8Array(totalLength);
        let offset = 0;
        for (const buffer of audioBuffers) {
          combined.set(new Uint8Array(buffer), offset);
          offset += buffer.byteLength;
        }
        
        const audioBlob = new Blob([combined], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      } else {
        // Single chunk
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ssml: ssmlChunks[0],
            languageCode: 'he-IL',
            voiceName: 'he-IL-Wavenet-A',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate speech');
        }

        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate speech');
      console.error('TTS Error:', err);
      setShouldAutoPlay(false);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate speech for a single verse
  const handleGenerateVerseSpeech = async (verseNum: number) => {
    // Stop current audio and clear URL
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setAudioUrl(null);
    
    setIsGenerating(true);
    setError(null);
    setSelectedVerse(verseNum);
    setShouldAutoPlay(true);

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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (err: any) {
      setError(err.message || 'Failed to generate speech');
      console.error('TTS Error:', err);
      setShouldAutoPlay(false);
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

  // Fetch word explanation from OpenAI API
  const fetchWordExplanation = async (word: string, verseNum: number, verseText: string) => {
    setIsLoadingExplanation(true);
    setExplanationError(null);
    setWordExplanation(null);

    try {
      const response = await fetch('/api/word-explanation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word,
          language: 'Hebrew',
          verse: verseText,
          bookName: bookName,
          chapterNum: chapterNum,
          verseNum: verseNum,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get explanation');
      }

      const data = await response.json();
      setWordExplanation(data.explanation);
      
      if (data.cached) {
        console.log('📦 Loaded from cache');
      } else {
        console.log('🤖 Fresh explanation from OpenAI');
      }
    } catch (err: any) {
      setExplanationError(err.message || 'Failed to load explanation');
      console.error('Word explanation error:', err);
    } finally {
      setIsLoadingExplanation(false);
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
              {[0.5, 1.0, 1.5].map((rate) => (
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
                <div
                  dir="rtl"
                  lang="he"
                  className="text-xl leading-relaxed text-gray-800 flex flex-wrap gap-x-2 gap-y-1"
                >
                  {verse.text.split(/\s+/).map((word, wordIndex) => {
                    const isActive = clickedWord?.verse === verse.verse && clickedWord?.wordIndex === wordIndex;
                    
                    return (
                      <span
                        key={wordIndex}
                        className="relative inline-block cursor-pointer hover:text-amber-600 hover:bg-amber-50 px-1 rounded transition-colors"
                        onClick={() => {
                          // Toggle: if same word is clicked, close it; otherwise open new one
                          if (isActive) {
                            setClickedWord(null);
                            setWordExplanation(null);
                            setExplanationError(null);
                          } else {
                            setClickedWord({ verse: verse.verse, wordIndex, word });
                            fetchWordExplanation(word, verse.verse, verse.text);
                          }
                        }}
                      >
                        {word}
                        {isActive && (
                          <WordTooltip
                            explanation={wordExplanation}
                            isLoading={isLoadingExplanation}
                            error={explanationError}
                          />
                        )}
                      </span>
                    );
                  })}
                </div>
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
