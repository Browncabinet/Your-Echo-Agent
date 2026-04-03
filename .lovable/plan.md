

## Plan: Indigo Color Scheme + Glassmorphism Touch-ups

Shift the primary color from blue to indigo and add glass-effect styling to buttons and cards across the app.

### Changes

1. **`src/index.css`** — Update CSS variables
   - Change `--primary` from `217 91% 55%` to `239 84% 67%` (indigo-500) in light mode
   - Change dark mode primary to `239 84% 72%`
   - Update `--ring`, `--secondary`, `--accent` to match indigo tones
   - Add a `.glass` utility class: `backdrop-blur-md bg-white/70 border border-white/20 shadow-lg` (dark: `bg-white/10`)

2. **`src/components/ui/button.tsx`** — Add glass variant
   - New `glass` variant: semi-transparent indigo background with backdrop-blur, subtle border, hover glow

3. **`src/pages/Auth.tsx`** — Apply glass styling
   - Login card gets glass effect (translucent background + blur)
   - Sign-in buttons use the new glass look

4. **`src/pages/Pricing.tsx`** — Apply glass styling
   - Plan cards get subtle glass treatment
   - CTA buttons use glass variant for non-highlighted plans, solid indigo for highlighted

5. **`src/pages/Index.tsx`** — Update "Upgrade" button to glass variant

### Technical notes
- Indigo hue `239` replaces blue hue `217` throughout the CSS variable system
- Glass effect uses `backdrop-filter: blur()` + semi-transparent backgrounds — supported in all modern browsers
- Keeps DM Sans font and existing layout structure unchanged

