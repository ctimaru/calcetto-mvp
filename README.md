# ⚽ App Calcetto - Soccer Match Booking MVP

A modern soccer match booking platform built with React, TypeScript, and Supabase.

## 🚀 Features

- User authentication and profile management
- Match creation and browsing
- Real-time match participation
- Payment integration
- Venue management
- Live chat for participants

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth, Database, Realtime)
- **Build Tool**: Vite
- **Icons**: Phosphor Icons

## 📋 Prerequisites

Before running this application, you need:

1. A Supabase account and project
2. Node.js 18+ installed
3. npm or yarn package manager
4. (Optional) A Stripe account for payment functionality

## ⚙️ Environment Setup

This application uses **Vite** and requires Supabase credentials to function. 

> 🔑 **Key Point**: This is a Vite app, so environment variables **must** use the `VITE_` prefix.

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup instructions.

**Quick Setup:**

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Supabase credentials to `.env`:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-key-here  # Optional, for payments
   ```

   Get these values from:
   - **Supabase**: [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API
   - **Stripe** (optional): [Stripe Dashboard](https://dashboard.stripe.com) → Developers → API keys

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🚀 Deployment

For detailed deployment instructions to Spark, Vercel, Netlify, and other platforms, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

### Quick Reference

When deploying to any platform, set these environment variables:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (optional, for payments)

**Important:** 
- Always use the `VITE_` prefix (required for Vite apps)
- Use the **anon/public key**, not the service role key
- Use the Stripe **publishable key** (starts with `pk_`), not the secret key
- After adding variables, redeploy your application
- If Stripe is not configured, payment functionality will be disabled gracefully

See [DEPLOYMENT.md](./DEPLOYMENT.md) for platform-specific instructions.

## 🔒 Security

The application includes hard checks for required environment variables. If `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are missing, the app will throw an error immediately, preventing undefined values from causing runtime issues.

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment instructions for all platforms
- [Supabase Setup Guide](./SUPABASE_SETUP.md) - Detailed Supabase configuration
- [Authentication Guide](./AUTH_GUIDE.md) - User authentication flow
- [Security Guidelines](./SECURITY.md) - Security best practices

## 🧹 Just Exploring?

No problem! If you were just checking things out and don't need to keep this code:

- Simply delete your Spark.
- Everything will be cleaned up — no traces left behind.

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
