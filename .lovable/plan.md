

## Plan: Redesign Auth Page as a Simple Landing + Login

Transform the current plain login card into a split-layout page that briefly explains the service before asking users to sign in. Keep it minimal and jargon-free.

### Layout

```text
┌─────────────────────────────────────────────┐
│  Logo + Nav (Pricing link)                  │
├──────────────────────┬──────────────────────┤
│                      │                      │
│  Hero text:          │   Login card         │
│  "Find leads.        │   (Google + email)   │
│   Send emails.       │                      │
│   Grow your business."│                      │
│                      │                      │
│  3 simple bullets:   │                      │
│  ✓ Scrape contacts   │                      │
│  ✓ AI-written emails │                      │
│  ✓ Track results     │                      │
│                      │                      │
│  "Starting at $0/mo" │                      │
│                      │                      │
├──────────────────────┴──────────────────────┤
│  Footer: "The affordable outreach tool"     │
└─────────────────────────────────────────────┘
```

On mobile (< 768px), stack vertically: hero text on top, login card below.

### Changes

1. **`src/pages/Auth.tsx`** — Redesign into a two-column layout:
   - **Left side**: Hero headline, 3 checkmark feature bullets (simple language), and a "Starting at $0/mo" note with link to pricing
   - **Right side**: Existing login card (Google + email/password)
   - Top nav bar with logo and "Pricing" link
   - Responsive: stacks on mobile

No new files needed. Just a visual redesign of the existing Auth page.

