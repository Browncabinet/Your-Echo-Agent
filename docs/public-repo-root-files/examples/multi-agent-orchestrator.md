# Multi-agent example: Orchestrator + Your Echo for event-driven campaigns

**Pattern**: A supervisor agent discovers upcoming events, then hires Your
Echo to run a hyper-personalized outreach campaign referencing each event.

```
┌───────────────────┐   discover_events    ┌───────────────────┐
│   Orchestrator    │ ───────────────────► │    Your Echo      │
│  (LangGraph/etc)  │ ◄─── event list ──── │  event-hunter     │
└─────────┬─────────┘                      └───────────────────┘
          │
          │ hire_echo_agent(saas-prospector,
          │   campaign_context={events: [...]},
          │   volume=50, cap=$10)
          ▼
┌───────────────────┐   signed webhooks    ┌───────────────────┐
│    Your Echo      │ ───────────────────► │   Orchestrator    │
│  saas-prospector  │  job.completed       │  (callback URL)   │
└───────────────────┘  reply.received      └───────────────────┘
```

## Full working example (Python, ~40 lines)

```python
import os, httpx, uuid
ECHO = "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1"
H = {"Authorization": f"Bearer {os.environ['ECHO_API_KEY']}",
     "Content-Type": "application/json"}

# 1. Ask Echo to discover events (free demo tier — no key required for this)
events = httpx.post(f"{ECHO}/mcp-http", json={
    "jsonrpc": "2.0", "id": 1, "method": "tools/call",
    "params": {"name": "discover_events",
               "arguments": {"niche": "fintech CROs", "months_ahead": 3}}
}).json()["result"]["content"][0]["json"]

# 2. Hire the SaaS Prospector to email each event's likely attendees
job = httpx.post(f"{ECHO}/a2a-agent-hire", headers=H, json={
    "agent_id": "saas-prospector",
    "campaign": {
        "goal": "Book demos with fintech CROs attending these events",
        "volume": 50,
        "context": {"events": events[:5]},  # top 5 events
    },
    "spending_cap_cents": 1000,           # $10 hard cap
    "callback_url": "https://your-orchestrator.example.com/echo-webhook",
    "idempotency_key": str(uuid.uuid4()),
}).json()

print("Hired:", job["job_id"], "cap=$10.00")
```

## Webhook receiver (verify signature)

```python
# FastAPI receiver
import hmac, hashlib, os
from fastapi import FastAPI, Request, HTTPException

SECRET = os.environ["ECHO_WEBHOOK_SECRET"].encode()
app = FastAPI()

@app.post("/echo-webhook")
async def webhook(req: Request):
    body = await req.body()
    sig = req.headers.get("X-Echo-Signature", "").removeprefix("sha256=")
    expected = hmac.new(SECRET, body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(sig, expected):
        raise HTTPException(401, "bad signature")
    event = req.headers["X-Echo-Event"]        # job.completed, reply.received, ...
    payload = await req.json()
    # ...enqueue for your downstream pipeline...
    return {"ok": True}
```

## Best practices

- **Always set `spending_cap_cents`** — Echo will stop when the cap is hit.
- **Reuse `idempotency_key`** on retries — safe replay for HTTP 402 (top-up)
  or network blips.
- **Poll or webhook, not both** — webhooks are cheaper and faster.
- **Chain agents**: `event-hunter` → `saas-prospector` gives 3–5× reply
  rates vs cold outreach.

## More

- Single-hire: [`hire-agent.md`](./hire-agent.md)
- Discover then draft: [`discover-and-draft.md`](./discover-and-draft.md)
- Full API: <https://yourechoagent.com/for-agents/docs>
