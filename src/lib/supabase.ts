import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "❌ Missing Supabase configuration!\n\n" +
    "Required environment variables:\n" +
    "  • VITE_SUPABASE_URL\n" +
    "  • VITE_SUPABASE_ANON_KEY\n\n" +
    "Local Development:\n" +
    "  1. Copy .env.example to .env\n" +
    "  2. Add your Supabase credentials from supabase.com/dashboard\n\n" +
    "Deployment (Spark/Vercel/Production):\n" +
    "  Set environment variables in your hosting platform settings.\n" +
    "  Use the ANON KEY (not service role key) for frontend apps.\n\n" +
    "See SUPABASE_SETUP.md for detailed instructions."
  )
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
