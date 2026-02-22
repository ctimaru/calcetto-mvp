# Environment Variables Quick Reference

## 🎯 What You Need

This Vite-based app requires **exactly 3 environment variables**:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx...
```

## 🔑 Where to Get Values

### Supabase
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon public** key → Use for `VITE_SUPABASE_ANON_KEY`

### Stripe
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Developers** → **API keys**
3. Copy:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`) → Use for `VITE_STRIPE_PUBLISHABLE_KEY`
   - ⚠️ **Never use the Secret key in frontend code!**

## 💻 Local Development

**File:** `.env` (in project root)

```bash
# Copy .env.example first
cp .env.example .env

# Then edit .env and add your values:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-actual-key-here
```

**Restart dev server after creating/editing `.env`:**
```bash
npm run dev
```

## 🚀 Deployment Platforms

### Spark (GitHub)
**Where:** Project Settings → Environment Variables

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_xxxxx...` |

### Vercel
**Where:** Project Settings → Environment Variables

Add for **all environments** (Production, Preview, Development)

### Netlify  
**Where:** Site Settings → Environment Variables

### Railway
**Where:** Project → Variables tab

### Render
**Where:** Environment → Environment Variables

## ✅ Checklist

- [ ] Variable names include `VITE_` prefix
- [ ] Using **anon/public** Supabase key (not service_role)
- [ ] Using **publishable** Stripe key (starts with `pk_`, not secret key)
- [ ] Supabase URL starts with `https://` and ends with `.supabase.co`
- [ ] No extra spaces or line breaks in values
- [ ] Restarted dev server (local) or redeployed (production)
- [ ] `.env` file is in `.gitignore` (never commit it!)

## ❌ Common Mistakes

| Wrong ❌ | Correct ✅ |
|---------|-----------|
| `SUPABASE_URL` | `VITE_SUPABASE_URL` |
| `STRIPE_PUBLISHABLE_KEY` | `VITE_STRIPE_PUBLISHABLE_KEY` |
| `NEXT_PUBLIC_SUPABASE_URL` | `VITE_SUPABASE_URL` |
| `REACT_APP_SUPABASE_URL` | `VITE_SUPABASE_URL` |
| Using Supabase service_role key | Using anon/public key |
| Using Stripe secret key (sk_) | Using publishable key (pk_) |
| `process.env.VITE_SUPABASE_URL` in code | `import.meta.env.VITE_SUPABASE_URL` |

## 🆘 Troubleshooting

### Error: "Missing Supabase configuration"

**Cause:** Environment variables not set or not detected

**Fix:**
1. Check variable names have `VITE_` prefix
2. Verify `.env` file exists in project root (local dev)
3. Restart dev server (local) or redeploy (production)
4. Check platform settings (deployment)

### Error: "Invalid API key"

**Cause:** Wrong key or typo

**Fix:**
1. Verify you copied the **anon/public** key, not service_role
2. Check for extra spaces or line breaks
3. Re-copy from Supabase Dashboard

### Variables work locally but not in production

**Cause:** Platform environment variables not configured

**Fix:**
1. Add variables in your hosting platform settings
2. Use exact names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Redeploy after adding variables

## 📖 More Information

- Full setup guide: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- Deployment guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Security info: [SECURITY.md](./SECURITY.md)
