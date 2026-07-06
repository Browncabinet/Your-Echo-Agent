import { useEffect, useState } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, Save, Check, Copy, Network, Zap } from "lucide-react";
import { toast as sonner } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PartnerShell } from "@/components/PartnerShell";
import { SeoHead } from "@/components/SeoHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEFAULT_URL =
  "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http";

const urlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .max(2048, "URL is too long")
  .url("Enter a valid https URL")
  .refine((v) => v.startsWith("https://"), "URL must use https://");

export default function SettingsMcp() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [url, setUrl] = useState("");
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  type TestResult =
    | { kind: "ok"; latencyMs: number; serverName?: string; protocolVersion?: string }
    | { kind: "warn"; latencyMs: number; detail: string }
    | { kind: "fail"; detail: string };
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const parseMaybeSse = async (res: Response): Promise<any> => {
    const ct = res.headers.get("content-type") ?? "";
    const text = await res.text();
    if (ct.includes("text/event-stream")) {
      const line = text.split("\n").find((l) => l.startsWith("data:"));
      if (!line) throw new Error("empty SSE stream");
      return JSON.parse(line.slice(5).trim());
    }
    return JSON.parse(text);
  };

  const testConnection = async () => {
    setError(null);
    const parsed = urlSchema.safeParse(url);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid URL");
      return;
    }
    setTesting(true);
    setTestResult(null);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const start = performance.now();
    try {
      const res = await fetch(parsed.data, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: {
            protocolVersion: "2025-06-18",
            capabilities: {},
            clientInfo: { name: "echo-settings-test", version: "1.0.0" },
          },
        }),
      });
      const latencyMs = Math.round(performance.now() - start);
      if (!res.ok) {
        setTestResult({ kind: "fail", detail: `HTTP ${res.status} ${res.statusText}` });
        return;
      }
      let body: any;
      try {
        body = await parseMaybeSse(res);
      } catch (e) {
        setTestResult({
          kind: "warn",
          latencyMs,
          detail: "Reachable, but response is not valid MCP JSON-RPC",
        });
        return;
      }
      if (body?.error) {
        setTestResult({
          kind: "warn",
          latencyMs,
          detail: `JSON-RPC error: ${body.error.message ?? "unknown"}`,
        });
        return;
      }
      if (body?.result) {
        setTestResult({
          kind: "ok",
          latencyMs,
          serverName: body.result?.serverInfo?.name,
          protocolVersion: body.result?.protocolVersion,
        });
        return;
      }
      setTestResult({
        kind: "warn",
        latencyMs,
        detail: "Reachable, but not an MCP initialize response",
      });
    } catch (e) {
      const err = e as Error;
      const detail =
        err.name === "AbortError"
          ? "Timed out after 8s"
          : `Network error: ${err.message}`;
      setTestResult({ kind: "fail", detail });
    } finally {
      clearTimeout(timer);
      setTesting(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        window.location.href = "/for-agents/login?next=/settings/mcp";
        return;
      }
      const { data, error } = await supabase
        .from("mcp_settings")
        .select("endpoint_url")
        .maybeSingle();
      if (!active) return;
      if (error) sonner.error("Could not load settings");
      const existing = data?.endpoint_url ?? "";
      setSavedUrl(existing || null);
      setUrl(existing || DEFAULT_URL);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const save = async () => {
    setError(null);
    const parsed = urlSchema.safeParse(url);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid URL");
      return;
    }
    setSaving(true);
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) {
      setSaving(false);
      sonner.error("Please sign in again");
      return;
    }
    const { error } = await supabase
      .from("mcp_settings")
      .upsert(
        { user_id: uid, endpoint_url: parsed.data },
        { onConflict: "user_id" }
      );
    setSaving(false);
    if (error) {
      sonner.error(error.message);
      return;
    }
    setSavedUrl(parsed.data);
    sonner.success("MCP endpoint saved");
  };

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    sonner.success("Copied");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <PartnerShell>
      <SeoHead
        title="MCP Endpoint Settings | Your Echo Agent"
        description="Configure the hosted MCP endpoint URL that AI assistants use to connect to your agent."
        path="/settings/mcp"
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-2xl mx-auto"
      >
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
            <Network className="w-3.5 h-3.5" /> Settings · MCP
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Hosted MCP endpoint
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            The URL AI assistants (Claude, Cursor, Windsurf, ChatGPT) use to
            connect to your agent.
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0d0d14] p-5">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="mcp-url" className="text-zinc-300">
                  Endpoint URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="mcp-url"
                    type="url"
                    inputMode="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co/functions/v1/mcp-http"
                    maxLength={2048}
                    className="font-mono text-xs bg-black/40 border-white/[0.08]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copy}
                    aria-label="Copy endpoint"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {error ? (
                  <p className="text-xs text-red-400">{error}</p>
                ) : (
                  <p className="text-[11px] text-zinc-500">
                    Must be an https URL. Default points at the hosted Echo MCP
                    server.
                  </p>
                )}
              </div>

              {testResult && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-white/[0.06] bg-black/30 p-3 text-xs">
                  <span
                    className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                      testResult.kind === "ok"
                        ? "bg-emerald-400"
                        : testResult.kind === "warn"
                        ? "bg-amber-400"
                        : "bg-red-400"
                    }`}
                  />
                  <div className="text-zinc-300">
                    {testResult.kind === "ok" && (
                      <>
                        Reachable · {testResult.latencyMs}ms
                        {testResult.serverName ? ` · ${testResult.serverName}` : ""}
                        {testResult.protocolVersion
                          ? ` · MCP ${testResult.protocolVersion}`
                          : ""}
                      </>
                    )}
                    {testResult.kind === "warn" && (
                      <>
                        {testResult.detail} · {testResult.latencyMs}ms
                      </>
                    )}
                    {testResult.kind === "fail" && <>Unreachable · {testResult.detail}</>}
                  </div>
                </div>
              )}

              <div className="mt-5 flex items-center justify-between gap-3">
                <p className="text-[11px] text-zinc-500 font-mono">
                  {savedUrl ? "Saved" : "Not saved yet"}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={testConnection}
                    disabled={testing || !url.trim()}
                  >
                    {testing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        Testing…
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-1.5" /> Test connection
                      </>
                    )}
                  </Button>
                  <Button onClick={save} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-1.5" /> Save endpoint
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </PartnerShell>
  );
}
