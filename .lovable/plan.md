## Issue
On `/` while signed in, `HomeRoute` renders `Index.tsx` which has no `<Footer />`. The footer (Docs • Status • Twitter • Support • Privacy • © 2026 Echo Agent) only appears on `Landing` and the standalone pages.

## Fix
Edit `src/pages/Index.tsx`:
1. Import `Footer` from `@/components/Footer`.
2. Render `<Footer />` just before the closing wrapper `</div>` of each of the 5 view branches:
   - home view (line ~359)
   - dashboard view (line ~408)
   - replies view (line ~443)
   - social view (line ~495)
   - default wizard view (line ~531)

No other changes — Footer component, Landing, and other pages stay as-is.