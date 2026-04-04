

## Plan: Replace Logo Assets and Increase Size

The user has provided new, cleaner versions of the logo icon and text. These are 1024x1024 images with the content filling more of the canvas (less whitespace padding), which should render larger at the same CSS dimensions.

### Changes

**1. Replace asset files**
- Copy `user-uploads://echo_agent_logo-3.png` → `src/assets/echo_agent_logo.png`
- Copy `user-uploads://your_echo_agent_text-3.png` → `src/assets/your_echo_agent_text.png`

**2. Increase Logo component sizes** (`src/components/Logo.tsx`)
- Icon: `h-20 w-20` (default), `h-16 w-16` (sm)
- Text: `h-20` (default), `h-16` (sm)

These new images have tighter cropping so the text/icon should fill the height much better than before.

