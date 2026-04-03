

## Plan: Add Google Authentication

Add Google login/signup so you and other developers can sign in easily. Campaigns will be saved per user in the database.

### Changes

1. **Configure Google Auth**
   - Use the Configure Social Login tool to generate the Lovable Cloud auth module (managed Google OAuth — no credentials needed)

2. **Create Auth Page** (`src/pages/Auth.tsx`)
   - Clean login/signup page with a prominent "Sign in with Google" button
   - Email/password option as fallback
   - Matches the existing blue/white design

3. **Create Auth Context** (`src/contexts/AuthContext.tsx`)
   - Provides current user session across the app
   - `onAuthStateChange` listener + `getSession` on mount
   - Exposes `user`, `session`, `signOut`, `loading`

4. **Create Protected Route wrapper** (`src/components/ProtectedRoute.tsx`)
   - Redirects unauthenticated users to `/auth`

5. **Update `src/App.tsx`**
   - Wrap routes with `AuthProvider`
   - Add `/auth` route
   - Protect the `/` route with `ProtectedRoute`

6. **Update header in `src/pages/Index.tsx`**
   - Show user avatar/email and a Sign Out button in the top-right

7. **Database: `campaigns` table** (migration)
   - Store campaigns per user with columns: `id`, `user_id`, `name`, `goal`, `niche`, `target_audience`, `leads`, `emails`, `status`, `created_at`
   - RLS: users can only read/update/delete their own campaigns
   - Load campaigns on login, save on create/update

### Technical notes
- Google OAuth uses `lovable.auth.signInWithOAuth("google", ...)` — fully managed, no API keys needed
- No profiles table needed initially — just `auth.users` + `campaigns`
- Email auto-confirm will NOT be enabled (users verify email for password signups)

