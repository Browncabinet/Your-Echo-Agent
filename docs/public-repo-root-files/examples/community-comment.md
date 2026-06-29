# Example: Generate value-first community comments

Paste into your MCP client:

> Find 5 active LinkedIn or Reddit communities where indie SaaS founders hang out. For the top community, generate 2 thoughtful comment variants I could post — one that's a contrarian take, one that's a story-based reply. Topic: pricing strategy for early-stage SaaS.

Expected behavior:
1. Calls `discover_events` with niche="indie SaaS founders", type="community"
2. Calls `generate_comment_for_community` for the top result with topic="pricing strategy"
3. Returns 2 comment drafts with reasoning

No API key required — both tools are in the demo tier.
