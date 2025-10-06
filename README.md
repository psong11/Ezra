# Ezra - Multilingual Poetry Collection

A beautiful, modern web application showcasing original poems in 33 different languages from around the world. Built with Next.js, React, TypeScript, and Tailwind CSS, with integrated Google Cloud Text-to-Speech.

## ✨ Features

### Poetry Collection
- **33 Original Poems**: Poems in diverse languages including English, Spanish, Arabic, Russian, Chinese, Hindi, Swahili, French, German, Italian, Japanese, Korean, and many more
- **Multilingual Support**: Proper handling of different writing systems including right-to-left (RTL) scripts
- **Dynamic File Reading**: Reads poem files at runtime from the `/data` folder using Node.js `fs` module
- **Search & Filter**: Real-time search functionality to find poems by title, language, or filename
- **Responsive Design**: Clean, elegant UI that works beautifully on all device sizes
- **Dark Mode**: Sophisticated dark theme with gradient accents

### Text-to-Speech (NEW! 🎤)
- **Google Cloud TTS Integration**: High-quality voice synthesis in multiple languages
- **Voice Selection**: Choose from hundreds of natural-sounding voices
- **Customizable Playback**: Adjust speaking rate and pitch
- **Smart Caching**: Deterministic caching with LRU memory + disk storage
- **Automatic Chunking**: Handles long texts by splitting at sentence boundaries
- **Keyboard Shortcut**: Press `S` to speak the current poem
- **Persistent Settings**: Last-used voice and settings saved to localStorage

### Technical Features
- **Accessibility**: Full keyboard navigation, semantic HTML, ARIA labels, and focus states
- **Client-Side Navigation**: Smooth transitions between list and detail views
- **No Database Required**: All content stored as simple UTF-8 text files
- **Type Safety**: Full TypeScript coverage with Zod validation
- **Testing**: Vitest unit tests for core utilities

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm (comes with Node.js)
- Google Cloud account (for Text-to-Speech features)

### Google Cloud Text-to-Speech Setup

#### 1. Enable the API

```bash
# Enable Text-to-Speech API in your Google Cloud project
gcloud services enable texttospeech.googleapis.com
```

#### 2. Authentication

Choose **ONE** of the following methods:

**Option A: Application Default Credentials (Recommended for Development)**
```bash
# Authenticate with your Google account
gcloud auth application-default login
```

**Option B: Service Account (Recommended for Production)**
```bash
# Create a service account
gcloud iam service-accounts create ezra-tts \
  --display-name="Ezra TTS Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:ezra-tts@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudtexttospeech.user"

# Create and download key
gcloud iam service-accounts keys create ~/ezra-tts-key.json \
  --iam-account=ezra-tts@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS=~/ezra-tts-key.json
```

#### 3. Configure Environment (Optional)

Create `.env.local` file (copy from `.env.local.example`):
```bash
# Optional: Path to service account JSON
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Optional: Project ID (auto-detected if using ADC)
GOOGLE_CLOUD_PROJECT=your-project-id
```

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd ezra
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Testing TTS API

You can test the TTS API directly with curl:

```bash
# Synthesize English text
curl -X POST http://localhost:3000/api/tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello from Ezra, a multilingual poetry collection",
    "languageCode": "en-US",
    "audioEncoding": "MP3"
  }' \
  --output hello.mp3

# With custom voice and parameters
curl -X POST http://localhost:3000/api/tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Bonjour, ceci est un test",
    "voiceName": "fr-FR-Standard-A",
    "languageCode": "fr-FR",
    "audioEncoding": "MP3",
    "speakingRate": 1.2,
    "pitch": 2.0
  }' \
  --output bonjour.mp3

# Get available voices
curl http://localhost:3000/api/voices
```

### Building for Production

```bash
# Create an optimized production build
npm run build

# Start the production server
npm start
```

## 📁 Project Structure

```
ezra/
├── data/                      # 33 UTF-8 .txt poem files
│   ├── english.txt
│   ├── spanish.txt
│   ├── arabic-rtl.txt
│   ├── chinese.txt
│   └── ... (30 more)
├── public/
│   └── tts-cache/            # TTS audio cache (auto-generated)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── poems/
│   │   │   │   ├── route.ts          # API: Get all poems
│   │   │   │   └── [id]/route.ts     # API: Get single poem
│   │   │   ├── tts/
│   │   │   │   └── route.ts          # API: Text-to-Speech synthesis
│   │   │   └── voices/
│   │   │       └── route.ts          # API: Get available TTS voices
│   │   ├── poem/
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Poem detail page with TTS
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home page with poem list
│   ├── components/
│   │   └── TTSControls.tsx           # TTS UI component
│   ├── hooks/
│   │   └── useTTS.ts                 # React hook for TTS
│   ├── lib/
│   │   ├── env.ts                    # Type-safe environment variables
│   │   └── tts/
│   │       ├── cache.ts              # LRU + disk cache
│   │       ├── chunking.ts           # Text chunking utilities
│   │       ├── client.ts             # Browser TTS client SDK
│   │       ├── google.ts             # Google TTS API wrapper
│   │       └── hash.ts               # Cache key generation
│   │   └── poemUtils.ts              # Utility functions
│   └── types/
│       └── poem.ts                    # TypeScript type definitions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## 🎨 Key Technologies

- **Next.js 14**: App Router for modern React applications
- **React 18**: UI component library
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Google Cloud Text-to-Speech**: High-quality voice synthesis
- **Zod**: Runtime type validation and schema checking
- **Vitest**: Fast unit testing framework
- **Node.js fs**: File system operations for reading poems at runtime

## 🌍 Languages Included

The collection includes poems in the following languages:

- English, Spanish, French, German, Italian, Portuguese
- Russian, Ukrainian, Polish, Czech, Serbian, Slovenian
- Arabic, Hebrew, Urdu (RTL scripts)
- Chinese, Japanese, Korean
- Hindi, Swahili, Vietnamese, Thai
- Greek, Swedish, Norwegian, Danish
- Hungarian, Romanian, Turkish, Tagalog, Indonesian

## 🎯 Accessibility Features

- Semantic HTML5 elements (`<main>`, `<article>`, `<nav>`, `<header>`, `<footer>`)
- ARIA labels for screen readers
- Keyboard navigation support (Tab, Enter, Escape)
- Focus indicators on all interactive elements
- Proper language and direction attributes for multilingual content
- High contrast color scheme for readability

## 📝 How It Works

### Poetry System
1. **Data Storage**: Poems are stored as plain text files in the `/data` folder
2. **Runtime Reading**: The Next.js API routes use Node.js `fs` module to read files dynamically
3. **Language Detection**: Filenames with `-rtl` suffix trigger right-to-left text direction
4. **Dynamic Routing**: Next.js App Router handles navigation between list and detail views
5. **Client-Side Filtering**: Search functionality filters poems in real-time without server requests

### Text-to-Speech System
1. **Authentication**: Uses Google Cloud ADC or service account credentials
2. **Voice Selection**: Fetches available voices from Google TTS API with 1-hour caching
3. **Synthesis Request**: Client sends text + parameters to `/api/tts`
4. **Cache Check**: Generates deterministic hash from all parameters
5. **Chunking**: Long texts are split at sentence boundaries (~5k char limit)
6. **Synthesis**: Google TTS API synthesizes each chunk with retry logic
7. **Concatenation**: Multiple audio buffers are merged if chunking was needed
8. **Caching**: Audio stored in `/public/tts-cache/<hash>.<ext>` + LRU memory cache
9. **Delivery**: Audio streamed to client as `audio/mpeg` (or other format)
10. **Playback**: Browser plays audio using native `<audio>` element

### Cache Strategy
- **Deterministic Keys**: Same text + voice + rate + pitch = same cache key
- **Disk Storage**: Files stored in `public/tts-cache/`
- **LRU Memory**: ~200 most recent items kept in memory
- **Immutable Cache**: Once cached, files never expire (cache-control: immutable)
- **Prefetching**: Hook supports prefetch for anticipatory loading

## 🔧 Available Scripts

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Create production build
- `npm start` - Run production server
- `npm run lint` - Run ESLint for code quality
- `npm test` - Run Vitest unit tests
- `npm run test:ui` - Run tests with UI

## 🎨 Customization

### Adding New Poems

1. Create a new `.txt` file in the `/data` folder
2. Name it descriptively (e.g., `bengali.txt` or `persian-rtl.txt`)
3. Add `-rtl` suffix for right-to-left languages
4. Write your poem content (title on first line)
5. The poem will automatically appear on the site!

### Styling

- Modify `src/app/globals.css` for global styles
- Adjust `tailwind.config.ts` for custom colors and themes
- Component styles are inline with Tailwind utility classes

## 🎤 TTS API Reference

### POST /api/tts

Synthesize text to speech with caching.

**Request Body:**
```json
{
  "text": "Hello world",           // Plain text OR
  "ssml": "<speak>Hello</speak>",  // SSML markup
  "voiceName": "en-US-Standard-A", // Optional: specific voice
  "languageCode": "en-US",         // Default: en-US
  "audioEncoding": "MP3",          // MP3 | OGG_OPUS | LINEAR16
  "speakingRate": 1.0,             // 0.25 - 4.0
  "pitch": 0.0,                    // -20.0 - 20.0
  "volumeGainDb": 0.0              // -96.0 - 16.0
}
```

**Response:**
- `200 OK`: Audio file (Content-Type: audio/mpeg, audio/ogg, or audio/wav)
- `400 Bad Request`: Validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Synthesis failed

**Response Headers:**
- `X-Cache-Hit`: `true` | `false` - Whether audio was served from cache
- `X-Cache-Key`: Hash key used for caching
- `Cache-Control`: Caching directives

### GET /api/voices

Get list of available TTS voices.

**Response:**
```json
{
  "voices": [
    {
      "name": "en-US-Standard-A",
      "languageCode": "en-US",
      "ssmlGender": "MALE",
      "naturalSampleRateHertz": 24000
    }
  ],
  "count": 800
}
```

## 🧪 Testing

Run unit tests:
```bash
npm test
```

Run tests with UI:
```bash
npm run test:ui
```

Tests cover:
- Cache key generation and hashing
- Text chunking at sentence boundaries
- LRU cache eviction
- Audio buffer concatenation
- SSML detection

## 🔒 Security & Best Practices

- ✅ Never commit service account keys to version control
- ✅ Use `.env.local` for local secrets (already in `.gitignore`)
- ✅ Production: Use service accounts with minimal permissions
- ✅ Development: Use ADC for convenience
- ✅ Enable billing alerts in Google Cloud Console
- ✅ Monitor TTS API usage and costs
- ✅ Cache directory is public - don't synthesize sensitive data

## 📄 License

This project is open source and available for educational purposes.

## 🙏 Acknowledgments

Built with love for poetry and languages from around the world.

---

**Ezra** - Where words transcend borders 🌏✨
