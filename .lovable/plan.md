

## Plan: Google-Only Authentication

Remove email/password sign-up/sign-in and keep only the Google OAuth button, since emails will be sent via Gmail anyway.

### Changes

1. **`src/pages/Auth.tsx`** — Simplify the login card:
   - Remove the email/password form, the "or" divider, and the sign-up/sign-in toggle
   - Keep only the "Sign in with Google" button
   - Update heading to "Sign in with Google to get started"
   - Clean up unused state variables (`email`, `password`, `isSignUp`, `submitting`) and the `handleEmailAuth` function

No other files need changes — AuthContext, ProtectedRoute, and the lovable OAuth integration all remain the same.

