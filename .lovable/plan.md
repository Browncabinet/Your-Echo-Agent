

## Root Cause

The "Couldn't read that URL" error happens because the **Quick Start detect** edge function is calling the wrong AI endpoint. It's using `https://api.lovable.dev/v1/chat/completions` which returns a **404 Not Found**. The correct URL is `https://ai.gateway.lovable.dev/v1/chat/completions` (which the email generation and campaign summary functions already use successfully).

The same bug also affects the **check-replies** edge function.

## Fix

**File 1: `supabase/functions/quick-start-detect/index.ts`** (line 36)
- Change `https://api.lovable.dev/v1/chat/completions` to `https://ai.gateway.lovable.dev/v1/chat/completions`

**File 2: `supabase/functions/check-replies/index.ts`** (line 248)
- Change `https://api.lovable.dev/v1/chat/completions` to `https://ai.gateway.lovable.dev/v1/chat/completions`

That's it -- two one-line URL fixes. After this, Fast Mode / Quick Start will work correctly.

