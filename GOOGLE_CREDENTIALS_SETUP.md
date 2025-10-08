# Google Cloud Credentials Setup for Vercel

## 🎯 Problem
Your app works locally using Application Default Credentials (ADC) from gcloud CLI, but Vercel doesn't have gcloud installed. We need to explicitly provide Google Cloud credentials via environment variable.

## 📋 Complete Setup Guide

### **Phase 1: Create Google Cloud Service Account**

#### Step 1: Go to Google Cloud Console
Visit: https://console.cloud.google.com/

#### Step 2: Select or Create Project
- If you already have a project, select it
- If not, click "Create Project" and give it a name (e.g., "ezra-app")

#### Step 3: Enable Text-to-Speech API
1. Go to: https://console.cloud.google.com/apis/library/texttospeech.googleapis.com
2. Click **"Enable"** button
3. Wait for it to enable (takes a few seconds)

#### Step 4: Create Service Account
1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Click **"+ Create Service Account"** at the top
3. Fill in the form:
   - **Service account name:** `ezra-tts-service`
   - **Service account ID:** (auto-filled: `ezra-tts-service`)
   - **Description:** `Service account for Ezra app TTS on Vercel`
4. Click **"Create and Continue"**

#### Step 5: Grant Permissions
1. In "Grant this service account access to project":
   - Click the "Select a role" dropdown
   - Search for: `Cloud Text-to-Speech API User`
   - Select: **"Cloud Text-to-Speech API User"**
2. Click **"Continue"**
3. Skip "Grant users access to this service account" (optional)
4. Click **"Done"**

#### Step 6: Create and Download JSON Key
1. You'll see your service account in the list
2. Click on the service account email (e.g., `ezra-tts-service@your-project.iam.gserviceaccount.com`)
3. Go to the **"Keys"** tab
4. Click **"Add Key"** → **"Create new key"**
5. Select format: **"JSON"**
6. Click **"Create"**
7. A JSON file will automatically download to your computer
   - Filename will be like: `your-project-name-xxxxx.json`

⚠️ **Important:** This file contains secrets! Keep it secure and never commit it to GitHub.

---

### **Phase 2: Add Credentials to Vercel**

#### Step 1: Open the Downloaded JSON File
1. Find the downloaded JSON file in your Downloads folder
2. Open it with a text editor (TextEdit, VS Code, etc.)
3. The content should look like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
  "client_email": "ezra-tts-service@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

#### Step 2: Copy the Entire JSON Content
- Select **ALL** the text (Cmd+A on Mac, Ctrl+A on Windows)
- Copy it (Cmd+C on Mac, Ctrl+C on Windows)
- Make sure you got the entire thing, including opening and closing curly braces `{ }`

#### Step 3: Add to Vercel
1. Visit: https://vercel.com/psong11s-projects/ezra/settings/environment-variables
2. Click the **"Add New"** button
3. Fill in the form:
   - **Name:** `GOOGLE_APPLICATION_CREDENTIALS_JSON`
   - **Value:** Paste the entire JSON content you copied
   - **Environments:** Check ALL three boxes:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
4. Click **"Save"**

You should see a success message!

#### Step 4: Verify Environment Variable Was Added
- You should now see `GOOGLE_APPLICATION_CREDENTIALS_JSON` in the list
- It should show "All" under Environments
- The value will be hidden (shows as dots `•••••••`)

---

### **Phase 3: Redeploy to Vercel**

#### Option A: Automatic Deployment
Vercel will automatically redeploy when you push to GitHub:
```bash
git push origin main
```

#### Option B: Manual Deployment (Recommended for Testing)
```bash
vercel --prod
```

This will:
1. Upload your latest code
2. Use the new environment variable
3. Deploy to production
4. Give you a URL to test

---

### **Phase 4: Test the Deployment**

#### Step 1: Wait for Build to Complete
- Watch the terminal for "✅ Production: https://ezra-..." message
- Or check: https://vercel.com/psong11s-projects/ezra

#### Step 2: Test on Your Phone
1. Open Safari/Chrome on your phone
2. Go to: **https://ezra-zeta.vercel.app**
3. Navigate to: Genesis → Chapter 1
4. Click on a verse number to play audio
5. It should work now! 🎉

#### Step 3: Check Logs if It Still Fails
```bash
vercel logs ezra-zeta.vercel.app --follow
```

Look for:
- ✅ "🔑 Using Google credentials from JSON environment variable"
- ❌ "Failed to initialize Google TTS Client"
- ❌ "Invalid Google credentials JSON"

---

### **Phase 5: (Optional) Add Credentials Locally**

If you want your local environment to match production exactly:

1. Open `.env.local` in your project
2. Add this line:
```bash
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...PASTE_ENTIRE_JSON_HERE...}
```

3. Make sure it's a single line (no line breaks)

**OR** keep using ADC (what you're doing now):
- Your local setup will continue using gcloud credentials
- Production will use the service account JSON
- Both will work!

---

## 🔍 Troubleshooting

### Issue: "Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON"
**Solution:** Make sure you copied the entire JSON, including `{ }` braces

### Issue: "Permission denied" or "403 Forbidden"
**Solution:** 
1. Check service account has "Cloud Text-to-Speech API User" role
2. Make sure Text-to-Speech API is enabled in your project

### Issue: Still getting 500 error after deployment
**Solution:**
1. Check Vercel logs: `vercel logs ezra-zeta.vercel.app`
2. Make sure you redeployed AFTER adding the env var
3. Verify env var is set: Go to Vercel dashboard → Settings → Environment Variables

### Issue: Works locally but not on Vercel
**Solution:**
1. Your local setup uses ADC (gcloud credentials)
2. Vercel needs explicit credentials in environment variable
3. Make sure you completed all steps above

---

## ✅ Verification Checklist

Before testing:
- [ ] Text-to-Speech API is enabled in Google Cloud
- [ ] Service account created with proper permissions
- [ ] JSON key downloaded
- [ ] `GOOGLE_APPLICATION_CREDENTIALS_JSON` added to Vercel
- [ ] All three environments checked (Production, Preview, Development)
- [ ] Redeployed to Vercel after adding env var
- [ ] Waited for build to complete (check Vercel dashboard)

---

## 📊 How Credentials Work

### Local Development (Your Computer)
```
You run: npm run dev
↓
App uses: Application Default Credentials (ADC)
↓
ADC finds: gcloud CLI credentials on your Mac
↓
Result: Works! ✅
```

### Production (Vercel)
```
User visits: ezra-zeta.vercel.app
↓
Vercel runs: Your app on their servers
↓
No gcloud CLI → ADC fails ❌
↓
Solution: Read GOOGLE_APPLICATION_CREDENTIALS_JSON
↓
Parse JSON → Create credentials object
↓
Pass to Google TTS client
↓
Result: Works! ✅
```

### Three Ways to Authenticate

| Method | Where | Priority | Use Case |
|--------|-------|----------|----------|
| **JSON string** | `GOOGLE_APPLICATION_CREDENTIALS_JSON` | 1 (Highest) | Vercel, production |
| **File path** | `GOOGLE_APPLICATION_CREDENTIALS` | 2 | Local with service account |
| **ADC** | gcloud CLI | 3 (Fallback) | Local development |

Our code checks in this order:
1. Is `GOOGLE_APPLICATION_CREDENTIALS_JSON` set? Use that.
2. Is `GOOGLE_APPLICATION_CREDENTIALS` set? Use that file.
3. Neither set? Fall back to ADC (gcloud).

---

## 🔒 Security Notes

### DO:
✅ Add credentials to Vercel environment variables  
✅ Keep the JSON file secure on your computer  
✅ Add `.env.local` to `.gitignore` (already done)  
✅ Rotate credentials periodically  

### DON'T:
❌ Commit credentials to GitHub  
❌ Share credentials publicly  
❌ Use personal credentials for production  
❌ Email or message credentials  

### If Credentials Are Compromised:
1. Go to Google Cloud Console
2. Delete the compromised service account key
3. Create a new key
4. Update Vercel environment variable
5. Redeploy

---

## 📞 Need Help?

If you're stuck on any step, let me know where you are in the process and I can help you troubleshoot!

**Common stopping points:**
1. "I can't find my Google Cloud project" → I can help you create one
2. "Service account creation is confusing" → I can walk you through it
3. "JSON file downloaded but I'm not sure what to do" → Just paste it in Vercel
4. "Added to Vercel but still not working" → Let's check the logs together

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Clicking verse numbers plays audio on your phone
- ✅ No "Internal Server Error" messages
- ✅ Vercel logs show: "🔑 Using Google credentials from JSON environment variable"
- ✅ TTS synthesis completes successfully

---

**Next Step:** Go through Phase 1 (Create Service Account) and let me know when you have the JSON file downloaded!
