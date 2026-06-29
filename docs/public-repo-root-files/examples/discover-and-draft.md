# Example: Discover events and draft outreach

Paste this into Claude Desktop or Cursor with Echo Agent MCP enabled:

> Discover upcoming AI agent conferences and webinars in 2026. For the top 3 results, draft a personalized cold email I could send to each event's organizer pitching our agent observability platform "Lensora". My name is Alex Chen, alex@lensora.dev. Save all 3 to my Radar.

Expected behavior:
1. Calls `discover_events` with niche="AI agents"
2. For each of the top 3 results, calls `draft_outreach_for_event`
3. Calls `add_to_radar` for each (requires `ECHO_API_KEY`)
4. Returns the drafted emails + Radar IDs
