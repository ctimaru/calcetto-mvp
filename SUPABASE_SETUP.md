# Supabase Setup Guide

This application uses Supabase for backend services including authentication, database, and real-time features.

## Environment Variables

The application requires the following environment variables to connect to Supabase:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous/public key

### Setting Up Environment Variables

1. **Create a `.env` file** in the root of your project:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. **Get your Supabase credentials:**
   - Go to your [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to Settings > API
   - Copy the "Project URL" and "anon/public" key

### For Deployment (Vercel/Production)

Set these environment variables in your hosting platform:

**Vercel:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Other Platforms:**
Follow your platform's documentation for setting environment variables.

## Error Handling

The application includes a hard check for these environment variables in `src/lib/supabase.ts`. If either variable is missing or undefined, the application will throw an error:

```
Missing SUPABASE_URL or SUPABASE_ANON_KEY. Set them in Spark/Vercel environment variables.
```

This prevents runtime errors from attempting to use undefined values.

## Usage

Import the Supabase client in your components:

```typescript
import { supabase } from '@/lib/supabase'

// Example: Fetch data
const { data, error } = await supabase
  .from('table_name')
  .select('*')
```

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Only use the anon/public key in client-side code
- Configure Row Level Security (RLS) policies in Supabase for data protection
