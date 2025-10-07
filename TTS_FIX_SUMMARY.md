# TTS "Load Failed" Error - Fix Summary

## Issue Description

Users were experiencing a "Load failed" error when trying to use the Google Text-to-Speech functionality in the application.

## Root Cause

The error was caused by attempting to use **Journey voices** (Google's newer generation voices with names like "Achernar", "Achird", "Algenib", etc.) which require a `model` parameter that is not currently accessible through the standard Google Cloud TTS API or requires special access/permissions.

When the application attempted to synthesize speech using these voices without the required model parameter, the Google API returned an error:
```
Error: 3 INVALID_ARGUMENT: This voice requires a model name to be specified.
```

This error manifested in the browser as a "Load failed" error when the audio element tried to load the response.

## Solution Implemented

### 1. Voice Filtering

**File:** `src/app/api/voices/route.ts`

- Added filtering logic to exclude Journey voices from the available voices list
- Journey voices are identified by their naming pattern: single capitalized words (e.g., "Achernar")
- Only standard voices are now returned (e.g., "en-US-Standard-A", "en-US-Wavenet-A")

```typescript
// Filter out Journey voices (single-word names)
const isJourneyVoice = /^[A-Z][a-z]+$/.test(voice.name);
return !isJourneyVoice;
```

### 2. Model Parameter Support

Added support for the optional `model` parameter throughout the codebase for future use:

**Files Updated:**
- `src/lib/tts/google.ts` - Added `model` parameter to `SynthesisParams` interface
- `src/lib/tts/client.ts` - Added `model` to `TTSOptions` interface
- `src/app/api/tts/route.ts` - Added `model` to request schema
- `src/lib/tts/hash.ts` - Include `model` in cache key generation

### 3. Journey Voice Detection

**File:** `src/lib/tts/google.ts`

- Added `isJourneyVoice()` helper function to detect Journey voices
- Added `isStandardVoice()` helper function to detect standard voices
- Added error handling to provide clear error messages if Journey voices are used without model

```typescript
export function isJourneyVoice(voiceName: string): boolean {
  const journeyVoicePattern = /^[A-Z][a-z]+$/;
  return journeyVoicePattern.test(voiceName);
}
```

### 4. Error Handling Improvements

- Clear error messages when Journey voices are attempted without model
- Better authentication error handling
- Improved error propagation through the stack

## Testing & Prevention

### Test Scripts Created

1. **`scripts/test-google-tts.ts`** - Core TTS functionality tests
   - Client initialization
   - Voice fetching
   - Text synthesis with various parameters
   - Chunking for long text
   - SSML support
   - Error handling

2. **`scripts/test-tts-api.ts`** - API endpoint tests
   - Server connectivity
   - Voice API endpoint
   - TTS synthesis endpoint
   - Caching functionality
   - Error scenarios

3. **`scripts/inspect-voices.ts`** - Voice inspection utility
   - Detailed voice metadata
   - Journey vs standard voice identification

4. **Browser Test Page** - `/test-tts` route
   - Interactive testing interface
   - Visual feedback
   - Error display

### Unit Tests

Created/updated unit tests in `src/lib/tts/__tests__/`:
- `hash-integration.test.ts` - Cache key generation with model parameter
- `chunking.test.ts` - Text chunking (existing, verified)
- `hash.test.ts` - Hash utilities (existing, verified)
- `cache.test.ts` - Cache functionality (existing, verified)

**Test Results:** ✅ 47/47 tests passing

### NPM Scripts

Added convenience scripts to `package.json`:
```json
{
  "test:tts": "tsx scripts/test-google-tts.ts",
  "test:tts-api": "tsx scripts/test-tts-api.ts"
}
```

## Verification Steps

### 1. Core TTS Test
```bash
npm run test:tts
```
Expected: All 8 tests pass

### 2. Unit Tests
```bash
npm test
```
Expected: All 47 tests pass

### 3. API Tests (requires running server)
```bash
npm run dev  # Terminal 1
npm run test:tts-api  # Terminal 2
```
Expected: All 7 API tests pass

### 4. Browser Test
1. Start server: `npm run dev`
2. Navigate to: `http://localhost:3000/test-tts`
3. Enter text and click play
4. Expected: Audio plays successfully with standard voices

## Files Changed

### Core Functionality
- `src/lib/tts/google.ts` - Model support, Journey voice detection
- `src/lib/tts/client.ts` - Model parameter in interface
- `src/lib/tts/hash.ts` - Model in cache key
- `src/app/api/tts/route.ts` - Model parameter support
- `src/app/api/voices/route.ts` - Journey voice filtering

### Testing
- `scripts/test-google-tts.ts` - Comprehensive TTS tests
- `scripts/test-tts-api.ts` - API endpoint tests
- `scripts/inspect-voices.ts` - Voice inspection tool
- `scripts/test-models.ts` - Model testing (exploratory)
- `scripts/README.md` - Testing documentation
- `src/app/test-tts/page.tsx` - Browser test page
- `src/lib/tts/__tests__/hash-integration.test.ts` - Model parameter tests

### Configuration
- `package.json` - Added test scripts

## Impact

### User-Facing
- ✅ "Load failed" error is resolved
- ✅ Only working voices are shown in the voice selector
- ✅ Clear error messages if issues occur
- ✅ Better overall reliability

### Developer-Facing
- ✅ Comprehensive test coverage
- ✅ Easy-to-run test scripts
- ✅ Clear documentation
- ✅ Future-proof model parameter support
- ✅ Better error diagnostics

## Future Considerations

1. **Journey Voice Support**
   - Monitor Google Cloud TTS for Journey voice model availability
   - When models become available, update `getDefaultModel()` function
   - Remove filtering in voices API
   - Update tests to include Journey voices

2. **Voice Metadata Enhancement**
   - Consider caching voice metadata including model requirements
   - Add voice quality indicators (Standard, WaveNet, Neural2, etc.)
   - Provide UI hints about voice characteristics

3. **Error Recovery**
   - Implement automatic fallback to default voice on error
   - Add retry logic with exponential backoff (already present)
   - Consider client-side voice validation before API call

## References

- [Google Cloud Text-to-Speech Documentation](https://cloud.google.com/text-to-speech/docs)
- [TTS API Voice List](https://cloud.google.com/text-to-speech/docs/voices)
- [Voice Selection Guide](https://cloud.google.com/text-to-speech/docs/voice-types)
