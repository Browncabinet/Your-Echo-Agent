## Why the score is 76%

The last SEO scan flagged 3 issues on the published site. Fixing them should noticeably raise the quality score.

## What I'll fix

**1. Page loads slowly (LCP / performance — low)**
- Find the hero element on `/` (largest above-the-fold image or H1).
- For the hero image: set explicit `width` + `height`, remove `loading="lazy"`, add `fetchpriority="high"`.
- For headline fonts: add `font-display: swap` to `@font-face` rules so text paints instantly with a fallback font.

**2. Add a Model Context Protocol (MCP) guide (content — low)**
- Add a new section to `/for-agents` (or a new `/blog/what-is-model-context-protocol` route) explaining MCP, agent-to-agent delegation, and how Your Echo Agent fits in.
- Target keywords: "what is model context protocol", "mcp server", "model context protocol anthropic".
- Include definition, A2A commerce benefit, and a sample MCP-compatible agent card snippet.

I'll ask you which placement you prefer before writing it.

**3. Google Search Console (indexing — mid) — needs you**
- This one I can't fully do for you: it requires you to authorize Google Search Console via the connector, verify ownership of `yourechoagent.com`, and submit the sitemap.
- I'll surface the connector and walk you through it after #1 and #2 are merged.

## Order

1. Performance fix (quick win, code-only).
2. MCP content section (after you pick: inline on `/for-agents` vs. new `/blog/...` route).
3. GSC connection (your action, I'll guide).

After #1 and #2, republish and rerun the SEO scan — score should climb. GSC unlocks the remaining points once verified.
