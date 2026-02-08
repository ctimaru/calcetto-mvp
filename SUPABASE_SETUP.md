# Supabase Setup Guide

This application uses Supabase for backend services including authentication, database, and real-time features.

## 📋 Required Environment Variables

This app is built with **Vite**, so all environment variables must use the `VITE_` prefix:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous/public key

> ⚠️ **Important**: Always use the **ANON/PUBLIC key** for frontend applications, never the service role key.

## 🔧 Local Development Setup

### Step 1: Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Navigate to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (the long JWT token under "Project API keys")

### Step 2: Configure Environment Variables

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and add your credentials:**
   ```bash
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Restart your dev server** to pick up the new variables:
   ```bash
   npm run dev
   ```

## 🚀 Deployment Setup

### Spark Deployment

If you're deploying via Spark (GitHub's hosting):

1. Go to your Spark project settings
2. Find the **Environment Variables** section
3. Add both variables:
   - Name: `VITE_SUPABASE_URL` → Value: `https://your-project.supabase.co`
   - Name: `VITE_SUPABASE_ANON_KEY` → Value: `your-anon-key`
4. Redeploy your Spark

### Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add both variables for all environments (Production, Preview, Development)
4. Redeploy your application

### Other Platforms (Netlify, Railway, etc.)

Follow your platform's documentation for setting environment variables. Always use the `VITE_` prefix and the anon key.

## 🔍 Environment Variable Formats

### ✅ Correct (Vite-based apps like this one):
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

In code:
```typescript
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
```

### ❌ Incorrect (these won't work):
```bash
# Missing VITE_ prefix
SUPABASE_URL=...
SUPABASE_ANON_KEY=...

# Next.js style (wrong framework)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Using process.env instead of import.meta.env
const url = process.env.SUPABASE_URL // ❌ Won't work in Vite
```

## 🛡️ Error Handling

The application includes a hard check in `src/lib/supabase.ts`. If environment variables are missing, you'll see:

```
❌ Missing Supabase configuration!

Required environment variables:
  • VITE_SUPABASE_URL
  • VITE_SUPABASE_ANON_KEY

Local Development:
  1. Copy .env.example to .env
  2. Add your Supabase credentials from supabase.com/dashboard

Deployment (Spark/Vercel/Production):
  Set environment variables in your hosting platform settings.
  Use the ANON KEY (not service role key) for frontend apps.
```

This prevents runtime errors from undefined values causing cryptic "cannot read .split of undefined" errors.

## 💡 Usage Examples

Import the pre-configured Supabase client anywhere in your app:

```typescript
import { supabase } from '@/lib/supabase'

// Authentication
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Database queries
const { data: matches } = await supabase
  .from('matches')
  .select('*')
  .eq('status', 'published')

// Real-time subscriptions
const channel = supabase
  .channel('match-updates')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'participations' },
    (payload) => console.log('New participation:', payload)
  )
  .subscribe()
```

## 🔒 Security Best Practices

- ✅ **Never commit `.env`** to version control (already in `.gitignore`)
- ✅ **Use the anon key** in frontend code, not the service role key
- ✅ **Configure Row Level Security (RLS)** policies in Supabase to protect your data
- ✅ **Rotate keys** if accidentally exposed
- ✅ **Use environment-specific** projects (dev/staging/production)

## 🆘 Troubleshooting

### "Missing Supabase configuration" error

**Problem**: Environment variables not loaded.

**Solutions**:
1. Check `.env` file exists in project root
2. Verify variable names have `VITE_` prefix
3. Restart dev server after creating/editing `.env`
4. On deployment platforms, ensure variables are set in platform settings

### "Invalid API key" or authentication errors

**Problem**: Wrong key or expired credentials.

**Solutions**:
1. Verify you copied the **anon/public key**, not service role key
2. Check for extra spaces or line breaks in the key
3. Ensure the Supabase project is active and not paused

### Variables work locally but not in deployment

**Problem**: Platform environment variables not configured.

**Solutions**:
1. Add variables to your hosting platform (Spark/Vercel/etc.)
2. Use exact same names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Redeploy after adding variables (some platforms require this)
