

## Plan: Replace "credits" with "emails" Across the App

The pricing page was updated to say "emails" but several other places still say "credits." This creates confusion — users don't know what a "credit" is or when they need to pay.

### Changes

**1. Welcome Modal** (`src/components/WelcomeModal.tsx`)
- Line 38: "50 free credits included" → "50 free emails included"
- Line 40: Keep "No credit card needed" (this refers to payment cards, not email credits)

**2. Navbar credit display** (`src/pages/Index.tsx`)
- Line 92: `"credits"` → `"emails"`

**3. Buy Credits Modal** (`src/components/BuyCreditsModal.tsx`)
- Line 100: "Buy Email Credits" → "Buy Email Packs"
- Line 104: "credits for this campaign" → "emails for this campaign"
- Line 105: "credits remaining" → "emails remaining"
- Line 199: "Buy Credits" button → "Buy Emails"
- Line 225: "Credits never expire" → "Emails never expire"

**4. Review & Approval** (`src/components/steps/ReviewApproval.tsx`)
- Line 157: "Not enough credits" → "Not enough emails"
- Line 159: "credits but need" → "emails but need"
- Line 163: "Buy Credits" button → "Buy Emails"

**5. Checkout Return** (`src/pages/CheckoutReturn.tsx`)
- Line 28: "Credits Added!" → "Emails Added!"
- Line 30: "Your email credits have been added" → "Your emails have been added"
- Line 37: "your credits will appear" → "your emails will appear"

**6. Terms page** (`src/pages/Terms.tsx`)
- Update "credit" references to "email" where it refers to the balance (keep "credit card" references)

This is a text-only change across 6 files — no logic changes.

