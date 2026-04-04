

## Fix: Progress indicator not clearing after lead search completes

**Problem**: When the search finishes and leads are found, `loading` is set to `false` but the `progress` array still contains entries — including non-"✓" entries like "Extracting contacts from results..." that render with a spinner icon. This makes it look like the search is still running even though it's done.

**Root cause** (in `LeadAcquisition.tsx`):
- Line 87 adds "Extracting contacts ✓" but the earlier "Extracting contacts from results..." entry (line 80) stays in the array with its spinner.
- After success, `progress` is never cleared or finalized — it keeps showing spinner icons for intermediate steps.

**Fix** (`src/components/steps/LeadAcquisition.tsx`):

1. After leads are found (line 89-91), clear the progress array or replace it with a single "done" state:
   ```typescript
   // After onUpdate({ leads }) on line 90, add:
   setProgress([]);
   ```

2. Do the same in the "no contacts found" branch (line 93):
   ```typescript
   setProgress([]);
   ```

3. Apply the same fix to `handleScrapeUrl` — clear progress after success (around line 55) and after the "No contacts found" toast (around line 57).

This is a 4-line fix across 2 functions in one file. After this, the progress card disappears once the search is done, and the green "✓ 30 leads found and ready!" card is the only status shown.

