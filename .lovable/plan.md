## Rewrite the About page

Two changes: align the visual treatment with the dark indigo theme used on Home/Auth, and rewrite the copy to describe the service and the niche-LinkedIn approach instead of a personal note.

### Visual

- Swap `bg-background` (light) for the same dark indigo treatment used on Landing/Auth: `bg-[#06061a]` body, radial indigo/fuchsia glows, faint grid overlay, `Manrope` font, indigo border accents.
- Header: transparent dark nav with white logo, `text-slate-400 hover:text-white` links, matching `Back` button.
- Main card: replace the white glass card with a dark card — `border-indigo-500/15 bg-gradient-to-b from-indigo-950/40 to-[#06061a]/80`, soft indigo glow shadow.
- Remove the round profile image. Replace with a small inline avatar chip + `@ladysoleil33` handle in the footer of the card (contact line only, no portrait).
- Keep `<Footer />` as-is (already site-wide).

### Copy (replaces lines 53–81)

Headline inside the card:
> **About Your Echo Agent**
> Outreach that actually sounds like a real person — because it's built on a real PR technique.

Body sections (short, scannable):

1. **What it is.** Your Echo Agent is an autonomous outreach platform that clones your voice, finds the right people, drafts hyper-personalized emails and LinkedIn messages, sends them, and handles replies intelligently — at a price that doesn't punish you for testing.

2. **Why it's different.** Most cold-email tools blast generic templates at scraped lists. Your Echo Agent uses a technique borrowed from senior marketing, sales, and PR executives: discover contacts on LinkedIn through the **groups, organizations, and associations they actually follow in niche markets** — then engage with their content (comments, reactions) before sending an email. Every message lands warm, in-context, and human.

3. **Who built it.** Built by a tech business development executive and publicist with **15+ startup launches** across PR, growth, and product. The same playbook used to land coverage in top publications and book meetings for founders is now wired into an agent anyone can run.

4. **Contact.** Questions, feedback, or partnerships → DM **[@ladysoleil33 on X](https://x.com/ladysoleil33)**.

5. (Keep the existing Tablecharts.co P.S. line — it's a tasteful nod, not a personal note.)

### Files

- `src/pages/About.tsx` — rewrite (theme + copy). Remove `profileImg` import.
- Update `SeoHead` description to match new positioning: "Autonomous outreach agents that find niche LinkedIn contacts via groups and associations, then send personalized email — a real PR technique, automated."

### Out of scope

- No changes to global Footer, Logo, or other pages.
- No new components.
