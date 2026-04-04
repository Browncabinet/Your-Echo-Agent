

## Plan: Make Email Draft Editing More Obvious in Email Builder

The Email Builder step already has editable subject and body fields, but they don't look obviously editable. The inputs blend in with the card background.

### Changes

**File: `src/components/steps/EmailBuilder.tsx`**

1. Add an "Edit" icon/indicator next to each field label (pencil icon) to signal editability
2. Add a visible "Click to edit" helper text or highlight styling on the subject and body fields
3. Add a top-level instruction banner: "✏️ Click any field below to edit your email drafts"
4. Make the Textarea and Input fields have a slightly more prominent border or background to signal they're interactive (e.g., `border-primary/20` on focus)

This is a small styling/UX update in one file — no logic changes.

