/**
 * Simple TTS Test Page
 * Navigate to /test-tts to test the TTS functionality
 */

'use client';

import { useState } from 'react';
import { TTSControls } from '@/components/TTSControls';

export default function TestTTSPage() {
  const [text, setText] = useState('Hello, this is a test of the Google Text-to-Speech functionality.');
  const [error, setError] = useState<Error | null>(null);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          TTS Functionality Test
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <label htmlFor="test-text" className="block text-sm font-medium text-gray-700 mb-2">
            Text to speak:
          </label>
          <textarea
            id="test-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="Enter text to synthesize..."
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            TTS Controls
          </h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 font-medium">Error:</p>
              <p className="text-red-600">{error.message}</p>
            </div>
          )}

          <TTSControls 
            text={text}
            onError={setError}
          />
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            ℹ️ Test Instructions
          </h3>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li>Enter or modify the text above</li>
            <li>Click the play button to synthesize and play the speech</li>
            <li>Use the controls to pause/resume/stop playback</li>
            <li>Adjust voice, speed, and pitch settings in the TTS controls</li>
            <li>Check browser console for detailed logs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
