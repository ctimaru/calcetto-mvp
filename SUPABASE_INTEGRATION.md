# Supabase Integration - Implementation Guide

## Overview

The Calcetto MVP application has been successfully integrated with Supabase for authentication and database operations. This document outlines the implementation details and next steps.

## ✅ Completed Integration

### 1. Authentication System
- **Supabase Auth** replaces the previous localStorage-based authentication
- Email/password registration and login
- Session management with automatic refresh
- Auth state listener in `App.tsx`

### 2. API Layer (`src/lib/api.ts`)
All backend operations now use Supabase client:
- `login(email, password)` - Sign in with Supabase Auth
- `register(email, password)` - Sign up new users
- `logout()` - Sign out current user
- `getProfile(userId)` - Fetch user profile from `profiles` table
- `listMatches(city)` - Query matches filtered by city
- `getMatchDetail(matchId)` - Fetch single match with field details
- `getMyParticipation(matchId, userId)` - Check participation status
- `joinMatch(matchId, userId)` - Create participation record

### 3. Updated Components

#### `App.tsx`
- Uses `supabase.auth.getSession()` and `supabase.auth.onAuthStateChange()`
- Fetches user profile after authentication
- Passes `userId` and `city` to child components

#### `AuthView.tsx`
- Simplified to email/password only (profile fields moved to post-registration)
- Calls Supabase `login()` and `register()` functions
- Shows success/error messages with toast notifications

#### `MatchList.tsx`
- Fetches matches from Supabase using `listMatches(city)`
- Displays matches from `matches` table with joined `fields` data
- Real-time loading states

#### `MatchDetail.tsx`
- Fetches match detail and participation status from Supabase
- `joinMatch()` creates participation record with `pending_payment` status
- Shows payment pending state (ready for Stripe integration)

### 4. Database Schema Support

The integration expects these Supabase tables:

**profiles**
- `user_id` (UUID, FK to auth.users)
- `role` (text: player, manager, admin)
- `name` (text)
- `age` (integer)
- `skill_level` (text)
- `home_city` (text)

**fields**
- `id` (UUID)
- `name` (text)
- `address` (text)

**matches**
- `id` (UUID)
- `city` (text)
- `start_time` (timestamptz)
- `duration_min` (integer)
- `skill_level` (text)
- `players_needed` (integer)
- `price_per_player_cents` (integer)
- `status` (text)
- `field_id` (UUID, FK to fields)

**participations**
- `id` (UUID)
- `match_id` (UUID, FK to matches)
- `user_id` (UUID, FK to auth.users)
- `status` (text: pending_payment, confirmed, cancelled)
- `created_at` (timestamptz)

## 🔧 Environment Setup

### Required Variables
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

See `SUPABASE_SETUP.md` for detailed configuration instructions.

## 📋 Next Steps

### Phase 1: Complete Profile Setup
After registration, users need to complete their profile:
1. Create `ProfileCreationDialog` component
2. Trigger after successful registration
3. Collect: name, age, skill_level, home_city
4. Update profile via Supabase: `supabase.from('profiles').update(...)`

### Phase 2: Stripe Payment Integration
Replace the "pending_payment" placeholder:
1. Add Stripe publishable key to environment
2. Install `@stripe/stripe-js` and `@stripe/react-stripe-js`
3. Create `PaymentForm` component with Stripe Elements
4. Call backend endpoint to create PaymentIntent
5. On success, update participation status to 'confirmed'

### Phase 3: Manager Match Creation
Enable managers to create matches:
1. Update `CreateMatchDialog` to use Supabase
2. Insert into `matches` table
3. Ensure proper RLS policies (managers can only edit own matches)

### Phase 4: Real-time Features
Add live updates:
1. Subscribe to match participation changes
2. Show real-time player count updates
3. Live chat using Supabase Realtime

### Phase 5: Field Management
For venue managers:
1. Create field CRUD operations
2. Availability calendar with time slots
3. Booking management dashboard

## 🔒 Security Considerations

### Row Level Security (RLS)
Ensure these policies are in place:

```sql
-- Profiles: Read all, update own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by all"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- Matches: Read all published, managers create/edit own
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published matches viewable by all"
  ON matches FOR SELECT 
  USING (status = 'published' OR created_by = auth.uid());

CREATE POLICY "Managers create matches"
  ON matches FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('manager', 'admin')
    )
  );

-- Participations: Users see own, managers see for their matches
ALTER TABLE participations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own participations"
  ON participations FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users join matches"
  ON participations FOR INSERT 
  WITH CHECK (user_id = auth.uid());
```

## 🧪 Testing Checklist

- [ ] User registration creates auth user
- [ ] User registration creates profile record (via trigger)
- [ ] Login with valid credentials works
- [ ] Login with invalid credentials shows error
- [ ] Session persists on page refresh
- [ ] Logout clears session
- [ ] Match list shows only published matches for selected city
- [ ] Match detail loads correct data
- [ ] Join match creates participation record
- [ ] Duplicate join shows appropriate error
- [ ] Profile data displays in header

## 🐛 Known Limitations

1. **Profile creation**: Currently registration only creates auth user. Profile fields need to be collected post-registration.
2. **Payment**: Payment is simulated. Stripe integration required for production.
3. **Match creation**: UI exists but needs Supabase integration.
4. **Real-time**: No live updates yet. Requires Supabase Realtime setup.
5. **Images**: No file upload for user avatars or field photos yet.

## 📚 Code References

**Supabase Client**: `src/lib/supabaseClient.ts`
**API Functions**: `src/lib/api.ts`
**Auth Flow**: `src/App.tsx` + `src/components/AuthView.tsx`
**Match Operations**: `src/components/MatchList.tsx` + `src/components/MatchDetail.tsx`

## 🎯 Migration Notes

### Removed Dependencies
- ❌ `useKV` hook for user/match/participation storage (replaced with Supabase)
- ❌ Client-side user management (replaced with Supabase Auth)
- ❌ localStorage for session persistence (replaced with Supabase session)

### Preserved Features
- ✅ UI/UX design and styling
- ✅ Component structure and navigation
- ✅ Form validation and error handling
- ✅ Toast notifications
- ✅ Responsive design

### Data Migration
If you have existing test data in localStorage/KV:
1. Export data from browser DevTools (Application → Local Storage)
2. Transform to match Supabase schema
3. Import via SQL or Supabase Dashboard

## 💡 Development Tips

### Testing Locally
```bash
# 1. Set up .env file
cp .env.example .env
# Edit .env with your Supabase credentials

# 2. Install dependencies
npm install

# 3. Run dev server
npm run dev
```

### Debugging Supabase Queries
```typescript
const { data, error } = await supabase
  .from('matches')
  .select('*')
  
console.log('Data:', data)
console.log('Error:', error)
```

### Testing Auth Flow
1. Register new user via UI
2. Check Supabase Dashboard → Authentication → Users
3. Verify profile created in Database → profiles table
4. Test login/logout cycle

## 🚀 Deployment

1. Set environment variables in your hosting platform
2. Push code to repository
3. Deploy should automatically pick up Vite env vars
4. Test authentication and database operations in production

See `DEPLOYMENT.md` for platform-specific instructions.
