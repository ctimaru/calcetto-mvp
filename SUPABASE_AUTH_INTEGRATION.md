# Supabase Authentication Integration

This document explains how Supabase authentication has been integrated into App Calcetto.

## Overview

The application now uses **Supabase Auth** for user authentication instead of the previous mock system. All user registration, login, and session management is handled by Supabase.

## Architecture

### Components Modified

1. **`src/lib/supabaseClient.ts`** - Supabase client singleton
2. **`src/components/AuthView.tsx`** - Login and registration UI with Supabase integration
3. **`src/App.tsx`** - Session management and auth state handling

### Flow

```
User Registration:
1. User fills registration form (name, email, password, age, skill_level, home_city)
2. `supabase.auth.signUp()` creates auth user
3. Supabase trigger automatically creates profile in `profiles` table
4. User receives confirmation email (if enabled)
5. User can login after email confirmation

User Login:
1. User enters email and password
2. `supabase.auth.signInWithPassword()` authenticates
3. App fetches user profile from `profiles` table
4. User object is created and session is established
5. User is redirected to main app

Session Management:
1. On app load, `supabase.auth.getSession()` checks for existing session
2. `supabase.auth.onAuthStateChange()` listens for auth events
3. SIGNED_IN: Fetch profile and set currentUser
4. SIGNED_OUT: Clear currentUser and redirect to auth view
```

## Key Functions

### Login

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})
if (error) throw error

// Fetch profile
const { data: profileData } = await supabase
  .from('profiles')
  .select('user_id, role, name, age, skill_level, home_city')
  .eq('user_id', data.user.id)
  .single()
```

### Registration

```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      name,
      age,
      skill_level,
      home_city,
    }
  }
})
if (error) throw error
```

The `options.data` metadata is passed to the database trigger which creates the profile.

### Get Session

```typescript
const { data } = await supabase.auth.getSession()
console.log(data.session) // Session object or null
```

### Listen to Auth Changes

```typescript
const { data: authListener } = supabase.auth.onAuthStateChange(
  async (event, session) => {
    if (event === 'SIGNED_OUT') {
      // Handle logout
    } else if (event === 'SIGNED_IN') {
      // Handle login
    }
  }
)

// Cleanup
authListener?.subscription?.unsubscribe()
```

### Logout

```typescript
const { error } = await supabase.auth.signOut()
if (error) throw error
```

## Environment Variables

The app requires two environment variables to connect to Supabase:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Setting Environment Variables

**For local development:**
1. Copy `.env.example` to `.env`
2. Fill in your Supabase URL and anon key
3. Restart the dev server

**For production/deployment:**
- Set these as environment variables in your hosting platform
- For Vercel: Project Settings → Environment Variables
- For Netlify: Site Settings → Environment Variables
- For GitHub Spark: Environment settings in the UI

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to: **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

⚠️ **Important:** Use the `anon` key, NOT the `service_role` key. The anon key is safe to expose in frontend code.

## Database Schema

The authentication system expects the following Supabase schema:

### `profiles` table

```sql
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'player',
  name TEXT,
  age INTEGER,
  skill_level TEXT,
  home_city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Trigger for Auto-Profile Creation

When a user signs up, a trigger automatically creates their profile:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, age, skill_level, home_city)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    (NEW.raw_user_meta_data->>'age')::INTEGER,
    NEW.raw_user_meta_data->>'skill_level',
    NEW.raw_user_meta_data->>'home_city'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Row Level Security (RLS)

Make sure RLS policies are configured for the `profiles` table:

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

## Error Handling

Common errors and solutions:

### "Missing SUPABASE_URL or SUPABASE_ANON_KEY"
- **Cause:** Environment variables not set
- **Solution:** Create `.env` file with proper values or set in hosting platform

### "Profile not found"
- **Cause:** Database trigger didn't create profile
- **Solution:** Check that the trigger exists and is properly configured

### "Invalid login credentials"
- **Cause:** Wrong email/password or user not confirmed
- **Solution:** Check email for confirmation link, or verify credentials

### "Email not confirmed"
- **Cause:** Supabase email confirmation is enabled but user hasn't confirmed
- **Solution:** Check email for confirmation link, or disable email confirmation in Supabase settings

## Testing

To test the authentication flow:

1. **Registration:**
   - Fill out the registration form
   - Check if you receive a confirmation email
   - Confirm your email (if required)

2. **Login:**
   - Use registered email and password
   - Verify you're redirected to the main app
   - Check that your profile data is displayed correctly

3. **Session Persistence:**
   - Login and refresh the page
   - Verify you remain logged in

4. **Logout:**
   - Click logout button
   - Verify you're redirected to the auth view
   - Try accessing protected routes (should redirect to login)

## Migration from Mock Auth

The previous mock authentication system stored users in Spark KV storage. With Supabase auth:

- ✅ Real authentication with secure password hashing
- ✅ Session management with JWT tokens
- ✅ Email confirmation support
- ✅ Password reset flows (can be added)
- ✅ OAuth providers support (can be added)
- ✅ Centralized user database

All existing components that use the `User` type continue to work without changes.

## Next Steps

Potential enhancements:

1. **Password Reset:** Add forgot password flow
2. **OAuth Providers:** Enable Google, GitHub, etc. login
3. **Profile Updates:** Add UI to update user profile
4. **Email Verification:** Customize email templates
5. **Magic Links:** Add passwordless login option

## Support

For Supabase documentation:
- [Auth Guide](https://supabase.com/docs/guides/auth)
- [JavaScript Client](https://supabase.com/docs/reference/javascript/auth-signup)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
