# TTS Testing Scripts

This directory contains evaluation and testing scripts for the Google Cloud Text-to-Speech functionality.

## Available Scripts

### 1. `test-google-tts.ts` - Core TTS Functionality Test

Tests the Google TTS client directly without the API layer.

**Run:**
```bash
npm run test:tts
# or
npx tsx scripts/test-google-tts.ts
```

**Tests:**
- ✅ Client initialization
- ✅ Fetching available voices
- ✅ Basic text synthesis
- ✅ Synthesis with specific voice
- ✅ Custom audio parameters (rate, pitch, volume)
- ✅ Long text with chunking
- ✅ SSML input
- ✅ Error handling

### 2. `test-tts-api.ts` - API Endpoint Test

Tests the Next.js API routes (`/api/tts` and `/api/voices`).

**Prerequisites:**
- Server must be running (`npm run dev`)

**Run:**
```bash
npm run test:tts-api
# or
npx tsx scripts/test-tts-api.ts
```

**Tests:**
- ✅ Server accessibility
- ✅ `/api/voices` endpoint
- ✅ `/api/tts` basic synthesis
- ✅ Caching functionality
- ✅ Voice-specific synthesis
- ✅ Custom parameters
- ✅ Error handling

### 3. `inspect-voices.ts` - Voice Inspector

Inspects and displays detailed information about available voices.

**Run:**
```bash
npx tsx scripts/inspect-voices.ts
```

### 4. Browser Test Page

A visual test page for testing TTS in the browser.

**Access:**
1. Start the dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/test-tts`

**Features:**
- Text input for custom synthesis
- Full TTS controls (play, pause, stop)
- Voice selection
- Audio parameter adjustment
- Error display

## Known Issues & Fixes

### Journey Voices Issue (Fixed)

**Problem:** "Load failed" error when using Journey voices (e.g., "Achernar", "Achird")

**Root Cause:** Journey voices require a `model` parameter that is not currently available through the standard API or requires special access.

**Solution:** The code now filters out Journey voices from the available voices list and only returns standard voices (e.g., "en-US-Standard-A", "en-US-Wavenet-A").

**Detection Pattern:**
- Journey voices: Single capitalized words (e.g., "Achernar")
- Standard voices: Hyphenated format (e.g., "en-US-Standard-A")

## Setup Requirements

### Google Cloud Authentication

The TTS functionality requires Google Cloud authentication. Two options:

#### Option 1: Application Default Credentials (Recommended for Development)
```bash
gcloud auth application-default login
```

#### Option 2: Service Account
1. Create a service account in Google Cloud Console
2. Download the JSON key file
3. Set environment variable:
```bash
# .env.local
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json
```

### Environment Variables

Create a `.env.local` file:
```bash
# Optional: Service account credentials
GOOGLE_APPLICATION_CREDENTIALS=

# Optional: Project ID (auto-detected if using ADC)
GOOGLE_CLOUD_PROJECT=your-project-id
```

## Continuous Testing

To prevent future issues:

1. **Before Deployment:**
   ```bash
   npm run test:tts
   ```

2. **After Starting Server:**
   ```bash
   npm run dev
   # In another terminal:
   npm run test:tts-api
   ```

3. **Manual Browser Test:**
   - Navigate to `/test-tts`
   - Test with different voices
   - Verify audio playback

## Troubleshooting

### "Load failed" Error
- **Cause:** Trying to use an unsupported Journey voice
- **Fix:** Use a standard voice from the dropdown (they contain hyphens)

### Authentication Errors
- **Cause:** Google Cloud credentials not set up
- **Fix:** Run `gcloud auth application-default login`

### "Rate limit exceeded"
- **Cause:** Too many requests to Google TTS API
- **Fix:** Wait a moment and try again, or check your API quota

### "No audio content in response"
- **Cause:** Empty or invalid text input
- **Fix:** Ensure text is not empty

## File Structure

```
scripts/
├── test-google-tts.ts      # Core TTS client tests
├── test-tts-api.ts          # API endpoint tests
├── test-models.ts           # Model testing (deprecated)
└── inspect-voices.ts        # Voice inspection tool

src/
├── app/
│   ├── test-tts/
│   │   └── page.tsx         # Browser test page
│   └── api/
│       ├── tts/route.ts     # TTS synthesis endpoint
│       └── voices/route.ts  # Voice list endpoint
└── lib/
    └── tts/
        ├── google.ts        # Google TTS client
        ├── client.ts        # Browser client
        ├── cache.ts         # Caching layer
        ├── chunking.ts      # Text chunking
        └── hash.ts          # Cache key generation
```

## Contributing

When adding new TTS features:

1. Add corresponding tests to `test-google-tts.ts`
2. Update API tests in `test-tts-api.ts` if API changes
3. Test manually via `/test-tts` page
4. Document any new requirements here
