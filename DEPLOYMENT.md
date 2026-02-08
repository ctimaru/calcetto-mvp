# 🚀 Deployment Guide

Complete guide for deploying App Calcetto to various platforms.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- ✅ A Supabase project with database tables configured
- ✅ Supabase URL and anon key ready
- ✅ Tested the app locally with your Supabase credentials
- ✅ Reviewed Row Level Security (RLS) policies in Supabase

## 🎯 Spark Deployment (GitHub)

Spark is GitHub's hosting platform optimized for this template.

### Step 1: Configure Environment Variables

1. Open your Spark project settings
2. Navigate to **Environment Variables** section
3. Add the following variables:

   | Variable Name | Value | Notes |
   |--------------|-------|-------|
   | `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` | Your Supabase anon/public key |

### Step 2: Deploy

1. Commit and push your changes to the main branch
2. Spark will automatically build and deploy
3. Verify the deployment by visiting your Spark URL

### Troubleshooting

**Build fails with "Missing Supabase configuration"**
- Ensure environment variables are set in Spark settings
- Verify variable names match exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Trigger a redeploy after adding variables

## ▲ Vercel Deployment

### Step 1: Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your Git repository

### Step 2: Configure Build Settings

Vercel should auto-detect the Vite configuration. Verify:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 3: Add Environment Variables

In the project settings, add environment variables for **all environments** (Production, Preview, Development):

| Variable Name | Value |
|--------------|-------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` |

### Step 4: Deploy

Click **"Deploy"** and Vercel will build and publish your app.

## 🎨 Netlify Deployment

### Step 1: Connect Repository

1. Go to [Netlify](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your Git repository

### Step 2: Build Settings

Configure the following:

- **Build command**: `npm run build`
- **Publish directory**: `dist`

### Step 3: Environment Variables

Go to **Site settings** → **Environment variables** and add:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | Your Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

### Step 4: Deploy

Click **"Deploy site"** and Netlify will handle the rest.

## 🚂 Railway Deployment

### Step 1: Create New Project

1. Go to [Railway](https://railway.app/)
2. Click **"New Project"** → **"Deploy from GitHub repo"**

### Step 2: Add Environment Variables

In the **Variables** tab, add:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### Step 3: Configure Build

Railway should auto-detect Vite. The app will build and deploy automatically.

## 🌐 General Deployment Tips

### Environment Variable Format

**Always use the VITE_ prefix** for environment variables in this app:

```bash
✅ VITE_SUPABASE_URL=...
✅ VITE_SUPABASE_ANON_KEY=...

❌ SUPABASE_URL=...              # Missing prefix
❌ NEXT_PUBLIC_SUPABASE_URL=...  # Wrong prefix (Next.js style)
```

### Security Keys

**Frontend apps should ONLY use the anon/public key:**

```
✅ Use: anon/public key (from Supabase Dashboard → Settings → API)
❌ Never use: service_role key (backend only, has admin access)
```

### Verification After Deployment

1. Visit your deployed URL
2. Open browser console (F12)
3. Look for any errors related to Supabase
4. Test authentication and basic features

### Common Deployment Issues

**Issue: "Cannot read property 'split' of undefined"**
- **Cause**: Environment variables not loaded
- **Fix**: Verify variable names and redeploy

**Issue: "Invalid API key"**
- **Cause**: Wrong key used or typo
- **Fix**: Double-check you copied the anon key, not service role key

**Issue: App loads but database queries fail**
- **Cause**: RLS policies blocking requests
- **Fix**: Review Supabase RLS policies and ensure anon role has proper permissions

**Issue: Variables work locally but not in production**
- **Cause**: Platform environment variables not set
- **Fix**: Add variables in your hosting platform settings and redeploy

## 🔄 Updating Environment Variables

After changing environment variables in your hosting platform:

1. **Trigger a redeploy** (most platforms don't auto-redeploy on env var changes)
2. **Clear browser cache** if you still see old behavior
3. **Check build logs** to ensure new variables are detected

## 📊 Production Monitoring

After deployment, monitor:

- **Error rates** in your hosting platform dashboard
- **Supabase usage** in Supabase Dashboard → Reports
- **Database connections** to avoid hitting limits
- **API rate limits** if using free tier

## 🆘 Need Help?

- 📖 [Supabase Setup Guide](./SUPABASE_SETUP.md)
- 🔒 [Security Guidelines](./SECURITY.md)
- 🔐 [Authentication Guide](./AUTH_GUIDE.md)
- 💬 Check the Supabase and Vite documentation for platform-specific issues
