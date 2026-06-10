Add an "About" link to the shared `Footer` component so it appears in the footer tab row on every page.

## Change

`src/components/Footer.tsx` — insert a new `<Link to="/about">About</Link>` in the footer's link row (between Docs and Status, or before Privacy — placing it right after Docs for prominence), styled with the same `hover:text-primary transition-colors` classes as the other links.

Result row: Docs · About · Status · @ladysoleil33 · Support · Privacy

No other files change. The `/about` route already exists in `App.tsx` pointing at `src/pages/About.tsx`.