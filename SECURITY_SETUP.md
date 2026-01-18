# 🔐 Security Setup Guide - DENIVO

## ✅ Changes Made (January 18, 2026)

All API keys and sensitive credentials have been moved to environment variables and removed from the codebase.

### Files Updated:
- ✅ `.gitignore` - Added .env files to prevent accidental commits
- ✅ `services/supabase.ts` - Removed hardcoded Supabase credentials and EmailJS keys
- ✅ `services/gemini.ts` - Using environment variables for Gemini API
- ✅ `PROJECT_DOCUMENTATION.md` - Removed all exposed API keys
- ✅ `.env.example` - Updated with proper placeholders
- ✅ Console logs exposing sensitive data have been removed

---

## 🚀 Vercel Deployment Setup

### Step 1: Add Environment Variables to Vercel

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your **denivo-premium-clothing** project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

#### Required Environment Variables:

```
VITE_SUPABASE_URL
Value: https://aplibkzcysdothjgfqmc.supabase.co
Environment: Production, Preview, Development

VITE_SUPABASE_ANON_KEY
Value: [Your Supabase Anon Key - Check .env file locally]
Environment: Production, Preview, Development

VITE_GEMINI_API_KEY
Value: [Your Gemini API Key - Check .env file locally]
Environment: Production, Preview, Development

VITE_EMAILJS_SERVICE_ID
Value: [Your EmailJS Service ID - Check .env file locally]
Environment: Production, Preview, Development

VITE_EMAILJS_TEMPLATE_ID
Value: [Your EmailJS Template ID - Check .env file locally]
Environment: Production, Preview, Development

VITE_EMAILJS_PUBLIC_KEY
Value: [Your EmailJS Public Key - Check .env file locally]
Environment: Production, Preview, Development
```

### Step 2: Redeploy Your Application

After adding environment variables:

1. Go to **Deployments** tab
2. Click on the three dots (•••) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic deployment

### Step 3: Verify Environment Variables

After deployment, check the browser console at:
https://denivo-premium-clothing.vercel.app

You should **NOT** see:
- ❌ Raw API keys
- ❌ Supabase URLs with tokens
- ❌ Any credential-related console.log messages

You **SHOULD** see:
- ✅ Application functioning normally
- ✅ Supabase connection working
- ✅ Orders being placed successfully
- ✅ Emails being sent

---

## 💻 Local Development Setup

### Step 1: Copy Environment Variables

```bash
cp .env.example .env
```

### Step 2: Fill in Your API Keys

Edit `.env` file with your actual credentials:

```env
# Get your Gemini API key from: https://ai.google.dev/
VITE_GEMINI_API_KEY=your_actual_gemini_key_here

# Get from Supabase Dashboard: https://supabase.com/dashboard
VITE_SUPABASE_URL=https://aplibkzcysdothjgfqmc.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key_here

# Get from EmailJS Dashboard: https://dashboard.emailjs.com/
VITE_EMAILJS_SERVICE_ID=your_actual_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_actual_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_actual_public_key_here
```

### Step 3: Run Development Server

```bash
npm install
npm run dev
```

---

## 🔍 How to Find Your API Keys

### Supabase Keys:
1. Go to: https://supabase.com/dashboard/project/aplibkzcysdothjgfqmc/settings/api
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### Gemini API Key:
1. Go to: https://ai.google.dev/
2. Click "Get API Key"
3. Create a new API key or use existing one
4. Copy → `VITE_GEMINI_API_KEY`

### EmailJS Keys:
1. Go to: https://dashboard.emailjs.com/
2. Under **Email Services**: Copy **Service ID** → `VITE_EMAILJS_SERVICE_ID`
3. Under **Email Templates**: Copy **Template ID** → `VITE_EMAILJS_TEMPLATE_ID`
4. Under **Account** → **General**: Copy **Public Key** → `VITE_EMAILJS_PUBLIC_KEY`

---

## ⚠️ Security Best Practices

### ✅ DO:
- Keep `.env` file in `.gitignore`
- Use environment variables for all sensitive data
- Rotate API keys if they were ever exposed
- Use different keys for development and production
- Regularly audit your codebase for hardcoded secrets

### ❌ DON'T:
- Never commit `.env` file to Git
- Never share API keys in documentation
- Never log sensitive data to console
- Never hardcode credentials in source code
- Never expose API keys in client-side code (except public keys like Supabase anon key)

---

## 🔄 If Your Keys Were Compromised

### Supabase:
1. Go to Dashboard → Settings → API
2. Click "Reset" on the compromised key
3. Update the new key in Vercel and local `.env`

### Gemini API:
1. Go to Google AI Studio
2. Delete the old API key
3. Create a new one
4. Update in Vercel and local `.env`

### EmailJS:
1. Go to EmailJS Dashboard → Account
2. Regenerate Public Key if needed
3. Update in Vercel and local `.env`

---

## 📝 Checklist

- [x] All hardcoded API keys removed from code
- [x] `.gitignore` updated to exclude `.env` files
- [x] `.env.example` created with placeholders
- [x] Console.logs exposing sensitive data removed
- [x] PROJECT_DOCUMENTATION.md cleaned of credentials
- [x] Changes committed to GitHub
- [ ] Environment variables added to Vercel
- [ ] Vercel application redeployed
- [ ] Production site tested and working

---

## 🆘 Troubleshooting

### "Supabase environment variables are not set"
- Check that all `VITE_SUPABASE_*` variables are set in Vercel
- Ensure you redeployed after adding variables
- Variable names must match exactly (case-sensitive)

### "The fashion assistant is not configured"
- Check that `VITE_GEMINI_API_KEY` is set
- Verify the API key is valid in Google AI Studio
- Ensure the key has necessary permissions

### Emails not sending:
- Check that all three `VITE_EMAILJS_*` variables are set
- Verify EmailJS account is active
- Check EmailJS dashboard for delivery reports

---

## 📞 Need Help?

If you encounter any issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Contact: tzkusman786@gmail.com
