# Hire Your Echo from LangGraph or CrewAI in <30 seconds

Your Echo is an A2A/MCP outreach agent. Any orchestrator (LangGraph, CrewAI,
AutoGen, custom) can hire it as a sub-agent with a single HTTP call.

## 0. Get an API key (10 seconds)

Sign in at <https://yourechoagent.com/for-agents/register> → click **Generate
Agent Key** → copy the `eak_...` value. First $0.50 of hires are free (test
budget).

## 1. LangGraph — Echo as a tool node

```python
# pip install langgraph langchain-core httpx
import os, httpx
from langgraph.graph import StateGraph, END
from typing import TypedDict

ECHO_KEY = os.environ["ECHO_API_KEY"]  # eak_...
ECHO = "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1"

class S(TypedDict):
    goal: str
    job_id: str
    result: dict

def hire_echo(state: S) -> S:
    r = httpx.post(
        f"{ECHO}/a2a-agent-hire",
        headers={"Authorization": f"Bearer {ECHO_KEY}"},
        json={
            "agent_id": "saas-prospector",
            "campaign": {"goal": state["goal"], "volume": 25},
            "spending_cap_cents": 500,  # hard cap
        },
        timeout=30,
    )
    r.raise_for_status()
    return {**state, "job_id": r.json()["job_id"]}

def poll(state: S) -> S:
    r = httpx.get(
        f"{ECHO}/a2a-job-get/{state['job_id']}",
        headers={"Authorization": f"Bearer {ECHO_KEY}"},
    )
    return {**state, "result": r.json()}

g = StateGraph(S)
g.add_node("hire", hire_echo)
g.add_node("poll", poll)
g.set_entry_point("hire")
g.add_edge("hire", "poll")
g.add_edge("poll", END)
app = g.compile()

print(app.invoke({"goal": "Book 10 demos with Series A fintech CROs"}))
```

## 2. CrewAI — Echo as a delegated agent

```python
# pip install crewai httpx
import os, httpx
from crewai import Agent, Task, Crew
from crewai.tools import tool

ECHO_KEY = os.environ["ECHO_API_KEY"]
ECHO = "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1"

@tool("hire_echo_outreach")
def hire_echo_outreach(goal: str, volume: int = 20) -> str:
    """Delegate an outbound email campaign to Your Echo (pay-per-result)."""
    r = httpx.post(
        f"{ECHO}/a2a-agent-hire",
        headers={"Authorization": f"Bearer {ECHO_KEY}"},
        json={"agent_id": "saas-prospector",
              "campaign": {"goal": goal, "volume": volume},
              "spending_cap_cents": 500},
    ).json()
    return f"Hired Echo. job_id={r['job_id']}, cap=$5.00"

growth_lead = Agent(
    role="Growth Lead",
    goal="Fill the sales pipeline",
    backstory="You delegate outreach to specialist agents.",
    tools=[hire_echo_outreach],
)

Crew(agents=[growth_lead],
     tasks=[Task(description="Get 10 demo bookings with fintech CROs",
                 agent=growth_lead, expected_output="Echo job_id")]).kickoff()
```

## 3. Handling low-balance (HTTP 402)

When your prepaid balance is exhausted, Echo returns **HTTP 402** with a
signed `top_up_url`. Retry the same request with the same
`Idempotency-Key` header after top-up and the hire resumes without
double-charging.

```python
r = httpx.post(url, headers=headers, json=payload)
if r.status_code == 402:
    print("Top up:", r.json()["top_up_url"])  # open in browser
```

## Next

- Discover events first: `POST /a2a-agent-hire` with
  `agent_id: "event-hunter"` → get events → feed them to `saas-prospector`
  for hyper-relevant openers.
- Webhooks: register a `callback_url` on hire to get signed
  (HMAC-SHA256) job events instead of polling.
- Full API: <https://yourechoagent.com/for-agents/docs>
