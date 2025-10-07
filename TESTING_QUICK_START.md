# Quick Start: TTS Testing

## ⚡ Fast Check

```bash
# Test core TTS functionality (no server needed)
npm run test:tts

# Expected output: 🎉 All tests passed!
```

## 🧪 Full Test Suite

### 1. Unit Tests
```bash
npm test
# or
npx vitest run
```
✅ Should see: `47 tests passed`

### 2. Core TTS Tests
```bash
npm run test:tts
```
✅ Should see: `🎉 All tests passed!`

### 3. API Tests (requires server)
```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Run tests
npm run test:tts-api
```
✅ Should see: `🎉 All API tests passed!`

### 4. Browser Test
1. `npm run dev`
2. Open: http://localhost:3000/test-tts
3. Click play button
4. ✅ Audio should play

## 🐛 If Tests Fail

### Authentication Error
```bash
gcloud auth application-default login
```

### Journey Voice Error
- ✅ FIXED: Journey voices are now filtered out
- Only standard voices (with hyphens) are available

### Rate Limit Error
- Wait 30 seconds
- Check Google Cloud quota

## 📝 Test Output Examples

### ✅ Success
```
✅ Client initialized successfully
✅ Retrieved 1616 voices
✅ Synthesized 34560 bytes of audio
🎉 All tests passed!
```

### ❌ Failure
```
❌ Test failed: Authentication required
```
→ Run: `gcloud auth application-default login`

## 🔍 Debugging

### Verbose Logs
Check terminal output for:
- 🔑 Authentication method
- 🎤 Synthesis progress
- ✅ Success indicators
- ❌ Error details

### Check Voice List
```bash
npx tsx scripts/inspect-voices.ts | head -50
```

### Test Specific Voice
Edit `scripts/test-google-tts.ts` and change the voice name.

## 📚 More Information

- Full docs: `scripts/README.md`
- Fix details: `TTS_FIX_SUMMARY.md`
- Project docs: `README.md`
