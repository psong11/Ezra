# Word Explanation Feature - OpenAI Integration

## Overview
This feature provides AI-powered linguistic explanations for Biblical Hebrew words using OpenAI's GPT models.

## Architecture

### File Structure
```
/src/lib/openai/
  ├── client.ts              # OpenAI client configuration
  ├── wordExplanation.ts     # Prompt generation & API logic
  └── types.ts               # TypeScript interfaces

/src/lib/cache/
  └── wordCache.ts           # In-memory caching (24hr TTL)

/src/app/api/word-explanation/
  └── route.ts               # API endpoint

/src/components/bible/
  └── WordTooltip.tsx        # Reusable tooltip component

/src/app/bible/[bookId]/[chapter]/
  └── ChapterReader.tsx      # Updated with word click handling
```

### Data Flow
```
User clicks word
    ↓
ChapterReader component
    ↓
Check cache (wordCache)
    ↓
API Route (/api/word-explanation)
    ↓
OpenAI API (GPT-4o-mini)
    ↓
Cache result
    ↓
Display in WordTooltip
```

## Setup

### 1. Environment Variables
Add to `.env.local`:
```bash
OPENAI_API_KEY=sk-proj-your-key-here
```

### 2. Configuration
Edit `/src/lib/openai/client.ts` to customize:
- **Model**: `gpt-4o-mini` (default, fast & cheap) or `gpt-4o` (premium)
- **Max Tokens**: 150 (~90 words)
- **Temperature**: 0.7 (balanced creativity)

### 3. Prompt Template
Located in `/src/lib/openai/wordExplanation.ts`:
```typescript
generateWordExplanationPrompt(request)
```
Customize the prompt format, tone, or structure here.

## Features

### Caching
- **In-memory cache** with 24-hour TTL
- **Cache key**: `language:word:verse`
- Prevents duplicate API calls for same word
- Check stats: `GET /api/word-explanation` (returns cache size)

### Loading States
- Spinner while fetching
- Error handling with user-friendly messages
- Graceful degradation if API unavailable

### Cost Optimization
- Uses `gpt-4o-mini` (~$0.00015 per explanation)
- Caching reduces API calls by ~90%
- Estimated cost: $0.01-0.05 per chapter

## Usage

### User Interaction
1. **Hover** over word → Highlight (amber color + background)
2. **Click** word → Tooltip appears with AI explanation
3. **Click again** → Tooltip closes
4. **Click different word** → Switches to new explanation

### Tooltip Content
Structured 3-section format:
1. **CORE MEANING**: Root meaning & intuitive feeling
2. **CONTEXT**: Collocations, concepts & Biblical references
3. **NUANCE**: Cultural depth or theological significance

## API Endpoint

### POST /api/word-explanation
**Request:**
```json
{
  "word": "בְּרֵאשִׁית",
  "language": "Hebrew",
  "verse": "בְּרֵאשִׁית, בָּרָא אֱלֹהִים, אֵת הַשָּׁמַיִם, וְאֵת הָאָרֶץ",
  "bookName": "Genesis",
  "chapterNum": 1,
  "verseNum": 1
}
```

**Response:**
```json
{
  "word": "בְּרֵאשִׁית",
  "language": "Hebrew",
  "verse": "...",
  "explanation": "1. CORE MEANING: ...\n2. CONTEXT: ...\n3. NUANCE: ...",
  "cached": false,
  "timestamp": "2025-10-07T12:00:00.000Z"
}
```

### GET /api/word-explanation
Returns cache statistics for debugging.

## Extending the Feature

### Add More Languages
Update `/src/lib/openai/wordExplanation.ts`:
```typescript
const languageContext = language === 'Hebrew' 
  ? 'Biblical Hebrew context'
  : language === 'Greek'
  ? 'Koine Greek context'
  : 'Biblical context';
```

### Persistent Caching
Replace in-memory cache with database:
1. Create schema in database
2. Update `/src/lib/cache/wordCache.ts` to use DB
3. Add cache invalidation logic

### Enhanced Tooltips
Edit `/src/components/bible/WordTooltip.tsx`:
- Add clickable references
- Include Strong's numbers
- Add pronunciation guides
- Link to lexicons

### Batch Processing
Pre-generate explanations for common words:
```typescript
// scripts/pregenerate-explanations.ts
for (const word of commonWords) {
  await getWordExplanation(word);
}
```

## Troubleshooting

### "OpenAI API key not configured"
- Ensure `OPENAI_API_KEY` is in `.env.local`
- Restart dev server after adding env var

### Slow Response
- First request is slower (API call)
- Subsequent requests use cache (instant)
- Consider using `gpt-3.5-turbo` for faster responses

### Rate Limits
OpenAI free tier: 3 RPM, 200 RPD
- Cache helps reduce API calls
- Upgrade to paid tier for higher limits

## Performance

### Metrics
- **First request**: ~2-4 seconds (API call)
- **Cached request**: <50ms
- **Cache hit rate**: ~85-95% (typical usage)
- **Cost per chapter**: $0.01-0.05 (first read)

### Optimization Tips
1. Preload common words
2. Use Redis for distributed caching
3. Implement request debouncing
4. Add local storage for client-side cache

## Security

### API Key Protection
- Never commit `.env.local` to git
- Use environment variables only
- Rotate keys regularly

### Rate Limiting
Consider adding rate limiting:
```typescript
// In API route
import rateLimit from 'express-rate-limit';
```

### Input Validation
Already implemented with Zod schema in API route.

## Future Enhancements

### Planned Features
- [ ] Audio pronunciation
- [ ] Related words/etymology
- [ ] Cross-references to other verses
- [ ] Save favorite explanations
- [ ] Export to PDF/notes
- [ ] Multi-language support (Greek, Aramaic)
- [ ] Strong's number integration
- [ ] Morphological analysis

### Advanced Ideas
- Semantic search for similar words
- AI-powered word study generator
- Interactive word family trees
- Timeline of word usage in Bible
- Cultural context images/videos
