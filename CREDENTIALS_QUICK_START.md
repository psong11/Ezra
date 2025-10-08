# Quick Reference: Google Credentials Setup

## 🚀 Fast Track (5 Minutes)

### Step 1: Get JSON Key
1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Create Service Account → Name: `ezra-tts-service`
3. Grant role: **"Cloud Text-to-Speech API User"**
4. Create Key → JSON → Download

### Step 2: Add to Vercel
1. Go to: https://vercel.com/psong11s-projects/ezra/settings/environment-variables
2. Click "Add New"
3. Name: `GOOGLE_APPLICATION_CREDENTIALS_JSON`
4. Value: Paste entire JSON content
5. Environments: Check all three ✅✅✅
6. Save

### Step 3: Deploy
```bash
vercel --prod
```

### Step 4: Test
Visit on phone: https://ezra-zeta.vercel.app

---

## 📋 Quick Checklist

- [ ] Enable Text-to-Speech API: https://console.cloud.google.com/apis/library/texttospeech.googleapis.com
- [ ] Create service account with TTS permissions
- [ ] Download JSON key file
- [ ] Copy entire JSON content
- [ ] Add to Vercel as `GOOGLE_APPLICATION_CREDENTIALS_JSON`
- [ ] Select all three environments
- [ ] Redeploy
- [ ] Test on phone

---

## 🔍 Troubleshooting

**500 Error?**
```bash
vercel logs ezra-zeta.vercel.app --follow
```

Look for:
- "Missing GOOGLE_APPLICATION_CREDENTIALS_JSON" → Not added to Vercel
- "Failed to parse" → JSON malformed, copy again
- "Permission denied" → Wrong role or API not enabled

**Still not working?**
1. Verify env var exists in Vercel dashboard
2. Make sure you redeployed AFTER adding it
3. Check that Text-to-Speech API is enabled
4. Verify service account has correct role

---

## 📞 Where to Get Help

**Detailed Guide:** See `GOOGLE_CREDENTIALS_SETUP.md`

**Google Cloud Console Links:**
- API Library: https://console.cloud.google.com/apis/library
- Service Accounts: https://console.cloud.google.com/iam-admin/serviceaccounts
- Text-to-Speech API: https://console.cloud.google.com/apis/library/texttospeech.googleapis.com

**Vercel Dashboard:**
- Environment Variables: https://vercel.com/psong11s-projects/ezra/settings/environment-variables
- Logs: https://vercel.com/psong11s-projects/ezra/logs
- Deployments: https://vercel.com/psong11s-projects/ezra

---

## ✅ Success Check

You're all set when:
- Clicking verse plays audio on phone ✅
- No 500 errors ✅
- Logs show "Using Google credentials from JSON" ✅
