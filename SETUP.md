# Denivo Premium Clothing - Complete Setup & Deployment Guide

## Project Overview
**Denivo** is a luxury e-commerce platform built with React, TypeScript, and Vite. It features:
- Product catalog management with categories (Men/Women)
- Shopping cart functionality
- User authentication via Supabase
- AI-powered fashion assistant (Gemini API)
- Admin panel for inventory management
- Responsive design with Tailwind CSS

**Live URL**: https://denivo-premium-clothing.vercel.app
**GitHub Repository**: https://github.com/tzkusman/denivo-premium-clothing

---

## Prerequisites
- Node.js (v16+) and npm
- Git installed
- GitHub account
- Vercel account
- Gemini API key (Google AI)
- Supabase project credentials

---

## Part 1: Local Setup & Development

### 1.1 Clone the Repository
```bash
git clone https://github.com/tzkusman/denivo-premium-clothing.git
cd denivo---premium-clothing
```

### 1.2 Install Dependencies
```bash
npm install
```

### 1.3 Configure Environment Variables
Create a `.env.local` file in the root directory with:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=https://aplibkzcysdothjgfqmc.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_jphwGPd_ZOog9XM5Hka7kA_kk285KuL
```

**Where to get these credentials:**
- **Gemini API Key**: Get from https://aistudio.google.com (create a free API key)
- **Supabase Credentials**: Available in your Supabase project settings > API

### 1.4 Run Locally
```bash
npm run dev
```
The app will start at `http://localhost:3000`

### 1.5 Build for Production
```bash
npm run build
```
Output files will be in the `dist/` directory.

### 1.6 Preview Production Build
```bash
npm run preview
```

---

## Part 2: GitHub Management

### 2.1 Initial Setup (One-time)
```bash
# Initialize git if not already done
git init

# Configure git user
git config user.name "Your Name"
git config user.email "your@email.com"

# Add remote repository
git remote add origin https://github.com/tzkusman/denivo-premium-clothing.git

# Create and switch to main branch
git branch -M main
```

### 2.2 Push Code to GitHub
```bash
# Stage all changes
git add -A

# Commit with a descriptive message
git commit -m "Your commit message here"

# Push to main branch
git push -u origin main
```

### 2.3 Daily Workflow
```bash
# Make changes to files...

# Check status
git status

# Stage specific files or all
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push origin main
```

### 2.4 Pull Latest Changes
```bash
git pull origin main
```

---

## Part 3: Vercel Deployment

### 3.1 First-Time Deployment Setup
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel (opens browser for authentication)
vercel login

# Deploy to production
vercel deploy --prod --yes
```

### 3.2 Configure Environment Variables in Vercel
```bash
# Add environment variables (one at a time)
vercel env add VITE_GEMINI_API_KEY
# Paste: AIzaSyC1WcMOOHEHnPfCb8stiRZYGurcXEx6kII
# Select: Production

vercel env add VITE_SUPABASE_URL
# Paste: https://aplibkzcysdothjgfqmc.supabase.co
# Select: Production

vercel env add VITE_SUPABASE_ANON_KEY
# Paste: sb_publishable_jphwGPd_ZOog9XM5Hka7kA_kk285KuL
# Select: Production
```

### 3.3 Redeploy After Environment Setup
```bash
vercel deploy --prod --yes
```

### 3.4 Update Vercel from GitHub
Once the GitHub repository is connected to Vercel (done automatically during first deploy):
- **Automatic deployment**: Every `git push` to `main` automatically triggers a production deploy
- **Manual deployment**: Use `vercel deploy --prod --yes` from terminal
- **Vercel Dashboard**: Go to https://vercel.com/dashboard to manage deployments

### 3.5 Current Environment Variables
```
VITE_GEMINI_API_KEY = AIzaSyC1WcMOOHEHnPfCb8stiRZYGurcXEx6kII
VITE_SUPABASE_URL = https://aplibkzcysdothjgfqmc.supabase.co
VITE_SUPABASE_ANON_KEY = sb_publishable_jphwGPd_ZOog9XM5Hka7kA_kk285KuL
```

---

## Part 4: Common Development Tasks

### 4.1 Add a New Component
1. Create a new file in `components/` directory
2. Write React component with TypeScript
3. Export from the component file
4. Import and use in `App.tsx` or other components

### 4.2 Add New Environment Variable
1. Add to `.env.local`:
   ```
   VITE_NEW_VAR=your_value
   ```
2. Use in code:
   ```typescript
   const value = import.meta.env.VITE_NEW_VAR;
   ```
3. Add to Vercel:
   ```bash
   vercel env add VITE_NEW_VAR
   ```
4. Redeploy:
   ```bash
   vercel deploy --prod --yes
   ```

### 4.3 Update Product Data
- Products are stored in Supabase `products` table
- Use Admin Panel (accessible to tzkusman786@gmail.com) to add/edit/delete products
- Changes appear immediately on the site

### 4.4 Make a Code Change & Deploy
```bash
# 1. Make changes to files
# 2. Test locally: npm run dev
# 3. Push to GitHub
git add .
git commit -m "Feature: describe your changes"
git push origin main

# 4. Vercel auto-deploys, or manually deploy:
vercel deploy --prod --yes
```

---

## Part 5: Project Structure

```
denivo---premium-clothing/
├── components/              # React components
│   ├── AdminPanel.tsx      # Admin inventory management
│   ├── AIAssistant.tsx     # Gemini AI fashion advisor
│   ├── AuthModal.tsx       # Login/signup modal
│   ├── CartSidebar.tsx     # Shopping cart
│   ├── Navbar.tsx          # Navigation header
│   ├── ProductCard.tsx     # Product display
│   └── SupabaseSetup.tsx   # Supabase config
├── services/                # External integrations
│   ├── gemini.ts           # Google Gemini API calls
│   └── supabase.ts         # Supabase auth & database
├── App.tsx                 # Main app component
├── types.ts                # TypeScript interfaces
├── index.tsx               # React DOM entry point
├── index.html              # HTML template
├── vite.config.ts          # Vite build config
├── tsconfig.json           # TypeScript config
├── package.json            # Dependencies
├── vercel.json             # Vercel config
├── .env.local              # Local environment variables
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore rules
└── README.md               # Project README
```

---

## Part 6: Troubleshooting

### Issue: "API Key must be set when running in a browser"
**Solution**: Ensure environment variables are prefixed with `VITE_` and are set in both `.env.local` and Vercel settings.

### Issue: Build fails on Vercel
**Solution**: 
```bash
# Clear Vercel cache and redeploy
vercel deploy --prod --yes

# Or from Vercel dashboard: Project Settings > Deployments > Clear Build Cache
```

### Issue: Products not loading
**Solution**: Check Supabase connection:
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check Supabase project has `products` table
- Ensure RLS policies allow public read access

### Issue: Authentication not working
**Solution**:
- Check Supabase Auth is enabled
- Verify email confirmation settings in Supabase
- Clear browser cookies and try again

### Issue: AI Assistant not responding
**Solution**:
- Verify Gemini API key is valid and has quota remaining
- Check Google AI Studio: https://aistudio.google.com
- Restart the app and try again

---

## Part 7: Security Notes

⚠️ **IMPORTANT**:
- Never commit `.env.local` file (it's in `.gitignore`)
- Never expose API keys in commits
- Supabase credentials shown are PUBLIC anon keys (safe to expose)
- Gemini API key is sensitive - keep it confidential
- Use Vercel environment variables for production secrets

---

## Part 8: Deployment Checklist

Before pushing to production:
- [ ] Test locally: `npm run dev`
- [ ] Build successfully: `npm run build`
- [ ] No console errors
- [ ] All features working (auth, products, cart, AI)
- [ ] Environment variables set in `.env.local`
- [ ] Commit message is descriptive

```bash
git add .
git commit -m "Feature: description"
git push origin main
# Vercel auto-deploys or: vercel deploy --prod --yes
```

---

## Part 9: Quick Reference Commands

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Start dev server | `npm run dev` |
| Build for production | `npm run build` |
| Preview build | `npm run preview` |
| Check git status | `git status` |
| Add changes | `git add .` |
| Commit changes | `git commit -m "message"` |
| Push to GitHub | `git push origin main` |
| Pull from GitHub | `git pull origin main` |
| Deploy to Vercel | `vercel deploy --prod --yes` |
| View Vercel logs | `vercel logs` |
| Add Vercel env var | `vercel env add VAR_NAME` |

---

## Part 10: Support & Resources

- **Vite Documentation**: https://vitejs.dev
- **React Documentation**: https://react.dev
- **TypeScript Documentation**: https://www.typescriptlang.org
- **Tailwind CSS**: https://tailwindcss.com
- **Supabase Documentation**: https://supabase.com/docs
- **Gemini API**: https://ai.google.dev
- **Vercel Documentation**: https://vercel.com/docs
- **GitHub Guides**: https://guides.github.com

---

**Last Updated**: January 14, 2026
**Maintainer**: Denivo Team
