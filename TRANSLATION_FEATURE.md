# English Translation Integration

## Overview
This feature adds English translations to every verse in the Bible using OpenAI's GPT-4o-mini model. Translations appear below each verse in the chapter reader.

## Features
- ✅ AI-powered translations from Biblical Hebrew and Koine Greek
- ✅ Verse-by-verse translation display
- ✅ Automatic batching and rate limiting
- ✅ Resume capability (skips already-translated verses)
- ✅ Support for all 66 books (39 Hebrew + 27 Greek)

## Setup

### 1. Ensure OpenAI API Key is Set
Make sure your `.env.local` file contains:
```bash
OPENAI_API_KEY=sk-proj-your-key-here
```

### 2. Type Definition Updated
The `BibleVerse` interface now includes an optional `translation` field:
```typescript
export interface BibleVerse {
  verse: number;
  text: string;
  words?: string[];
  translation?: string; // English translation
}
```

## Usage

### Testing (Recommended First)
Test the translation system on Genesis Chapter 1 (first 10 verses):
```bash
npm run test-translation
```

This will:
- Translate 10 verses from Genesis 1
- Display original Hebrew text and English translations
- Verify the OpenAI API connection works
- Show you the translation quality

### Full Translation (All 66 Books)
⚠️ **Warning**: This will take several hours due to rate limiting and will consume significant OpenAI API credits.

```bash
npm run add-translations
```

**What it does:**
1. Processes all 66 books (39 Hebrew + 27 Greek)
2. Translates ~31,000 verses
3. Saves translations back to JSON files
4. Automatically resumes if interrupted

**Estimated Time:** 
- ~500ms delay per batch
- 10 verses per batch
- ~31,000 verses total
- **≈ 4-5 hours total runtime**

**Estimated Cost:**
- Model: GPT-4o-mini ($0.150 per 1M input tokens, $0.600 per 1M output tokens)
- Input: ~31,000 verses × ~50 tokens = ~1.55M tokens = $0.23
- Output: ~31,000 verses × ~30 tokens = ~0.93M tokens = $0.56
- **Total: ~$0.80 USD**

## How It Works

### Translation Process
1. **Batching**: Groups 10 verses together for efficient API calls
2. **Context**: Provides book name, chapter number, and language to AI
3. **Prompt**: Instructs AI to provide faithful, clear translations
4. **Parsing**: Extracts verse numbers and translations from response
5. **Validation**: Matches translations back to verse numbers
6. **Persistence**: Saves updated JSON with translation fields

### Rate Limiting
- **500ms delay** between batches (to respect OpenAI rate limits)
- **1000ms delay** between books (extra safety)
- **10 verses per batch** (optimal for accuracy and efficiency)

### Resume Capability
The script automatically skips verses that already have translations:
```
⏭️  Chapter 5: Already has translations
```

This means you can:
- Stop and restart the script anytime
- Run it multiple times without wasting API calls
- Update specific books individually

## UI Display

Translations appear automatically in the chapter reader:

```tsx
{/* Original Hebrew/Greek Text */}
<div dir="rtl" lang="he" className="text-3xl">
  {verse.text}
</div>

{/* English Translation (if available) */}
{verse.translation && (
  <div className="mt-3 pt-3 border-t border-gray-200">
    <p className="text-base text-gray-600 italic">
      {verse.translation}
    </p>
  </div>
)}
```

## Files Modified

### Core Files
- **`src/types/bible.ts`** - Added `translation?: string` field to `BibleVerse`
- **`src/app/bible/[bookId]/[chapter]/ChapterReader.tsx`** - Display translations below verses

### Scripts
- **`scripts/add-translations.ts`** - Main script to add translations to all books
- **`scripts/test-translation.ts`** - Test script for Genesis Chapter 1
- **`package.json`** - Added npm scripts

## Example Output

### Terminal (during translation)
```
╔════════════════════════════════════════════════════╗
║   BIBLE TRANSLATION GENERATOR                     ║
║   Adding English translations to all books        ║
╚════════════════════════════════════════════════════╝

📚 Found 66 books (39 Hebrew, 27 Greek)

📖 Processing Genesis...
   📝 Chapter 1: Translating 31 verses...
   🤖 Calling OpenAI for 10 verses...
   ✅ Received response (847 chars)
   ✅ Chapter 1: Complete (31 verses)
✅ Genesis: 31/31 verses translated
```

### UI (ChapterReader)
```
Verse 1
בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ
─────────────────────────────────────────────────────
In the beginning God created the heavens and the earth.
```

## Translation Quality

The AI is prompted to:
- ✅ Be faithful to the original text
- ✅ Use clear, natural English
- ✅ Maintain verse structure
- ✅ Avoid adding commentary or interpretation
- ✅ Use formal biblical language where appropriate

**Model**: `gpt-4o-mini`
**Temperature**: 0.3 (for consistency)
**Max Tokens**: 2000 per batch

## Progress Tracking

The script provides real-time feedback:
```
📖 Processing Matthew...
   📝 Chapter 1: Translating 25 verses...
   ✅ Chapter 1: Complete (25 verses)
   📝 Chapter 2: Translating 23 verses...
   ✅ Chapter 2: Complete (23 verses)
✅ Matthew: 48/48 verses translated
```

## Error Handling

### API Errors
If OpenAI API fails, verses get `[Translation error]` placeholder:
```json
{
  "verse": 5,
  "text": "וַיִּקְרָא...",
  "translation": "[Translation error]"
}
```

### Rate Limit Errors
Built-in delays prevent rate limiting, but if it occurs:
1. Script will continue with remaining verses
2. Re-run script later to retry failed verses
3. Resume capability ensures no duplicate work

### Missing API Key
Script exits immediately with clear error:
```
❌ ERROR: OPENAI_API_KEY environment variable not set
   Please set your OpenAI API key in .env.local
```

## Performance Optimization

### Why 10 verses per batch?
- **Too small (1-5 verses)**: Too many API calls, slow, expensive
- **Too large (20+ verses)**: AI loses context, accuracy drops
- **Sweet spot (10 verses)**: Good balance of speed and accuracy

### Why 500ms delay?
- OpenAI free tier: 3 RPM (requests per minute)
- OpenAI tier 1: 500 RPM
- 500ms = 2 requests/second = 120 RPM (safe for all tiers)

## Future Enhancements

Potential improvements:
1. **Translation selection**: Allow users to choose from multiple translations
2. **Caching**: Cache translations in database instead of JSON files
3. **Comparison view**: Show multiple translations side-by-side
4. **Custom translations**: Allow users to submit better translations
5. **Translation notes**: Add scholarly notes and alternate renderings

## Troubleshooting

### Problem: Translations not showing
**Solution**: Check that verse objects have `translation` field:
```bash
cat src/data/bible/hebrew/genesis.json | grep "translation" | head -5
```

### Problem: API key errors
**Solution**: Verify `.env.local` has correct key:
```bash
echo $OPENAI_API_KEY
```

### Problem: Script takes too long
**Solution**: Process specific books individually by modifying script:
```typescript
const hebrewBooks = fs.readdirSync(hebrewDir)
  .filter(f => f.endsWith('.json') && f === 'genesis.json') // Only Genesis
```

### Problem: Translations look wrong
**Solution**: 
1. Check model temperature (should be 0.3)
2. Review prompt in `add-translations.ts`
3. Run test-translation to verify single chapter quality
4. Consider using gpt-4 for better accuracy (but higher cost)

## Commands Reference

| Command | Description | Time | Cost |
|---------|-------------|------|------|
| `npm run test-translation` | Test 10 verses | ~30 sec | < $0.01 |
| `npm run add-translations` | All 66 books | ~5 hours | ~$0.80 |

## Next Steps

1. ✅ Run `npm run test-translation` to verify setup
2. ✅ Review translation quality from test
3. ✅ Run `npm run add-translations` to process all books
4. ✅ Commit and push updated JSON files
5. ✅ Deploy to Vercel
6. ✅ Verify translations display in UI

---

**Status**: ✅ Ready to use  
**Version**: 1.0  
**Last Updated**: October 11, 2025
