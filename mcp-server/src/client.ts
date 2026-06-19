const DEFAULT_BASE = "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1";

export class EchoClient {
  private base: string;
  private apiKey: string;

  constructor(apiKey: string, base?: string) {
    if (!apiKey) throw new Error("ECHO_API_KEY is required (get one at https://yourechoagent.com/for-agents/register)");
    if (!apiKey.startsWith("eak_")) throw new Error("ECHO_API_KEY must start with 'eak_'");
    this.apiKey = apiKey;
    this.base = (base || DEFAULT_BASE).replace(/\/$/, "");
  }

  private async req<T = unknown>(path: string, init: RequestInit = {}, query?: Record<string, string | undefined>): Promise<T> {
    const url = new URL(`${this.base}${path}`);
    if (query) for (const [k, v] of Object.entries(query)) if (v != null) url.searchParams.set(k, v);
    const res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...(init.headers || {}),
      },
    });
    const text = await res.text();
    let data: any;
    try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
    if (!res.ok) {
      const msg = data?.error || data?.message || res.statusText;
      throw new Error(`Echo API ${res.status}: ${msg}${data?.detail ? ` — ${data.detail}` : ""}`);
    }
    return data as T;
  }

  listAgents(params: { niche?: string; capability?: string } = {}) {
    return this.req("/a2a-agents-list", { method: "GET" }, params);
  }

  getAgent(agent_id: string) {
    return this.req("/a2a-agent-get", { method: "GET" }, { agent_id });
  }

  hire(body: Record<string, unknown>) {
    return this.req("/a2a-agent-hire", { method: "POST", body: JSON.stringify(body) });
  }

  getJob(job_id: string) {
    return this.req("/a2a-job-get", { method: "GET" }, { job_id });
  }

  controlJob(job_id: string, action: "pause" | "resume" | "cancel") {
    return this.req("/a2a-job-control", { method: "POST", body: JSON.stringify({ job_id, action }) });
  }

  rateJob(job_id: string, stars: number, feedback?: string) {
    return this.req("/a2a-job-rate", { method: "POST", body: JSON.stringify({ job_id, stars, feedback }) });
  }
}
