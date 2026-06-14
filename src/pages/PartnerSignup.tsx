import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PartnerShell } from "@/components/PartnerShell";
import { SeoHead } from "@/components/SeoHead";
import { Copy, Check, Loader2, Terminal, ArrowRight, KeyRound, Mail, Lock, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";

const FUNCTIONS_BASE = "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1";

type Step = "auth" | "profile" | "key";

function StepDots({ step }: { step: Step }) {
  const order: Step[] = ["auth", "profile", "key"];
  const idx = order.indexOf(step);
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {order.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`h-1.5 rounded-full transition-all ${
              i === idx ? "w-8 bg-indigo-400" : i < idx ? "w-4 bg-emerald-500" : "w-4 bg-white/10"
            }`}
          />
        </div>
      ))}
    </div>
  );
}

export default function PartnerSignup() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [step, setStep] = useState<Step>("auth");

  const [authMode, setAuthMode] = useState<"magic" | "password">("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [useCase, setUseCase] = useState("hire");
  const [submitting, setSubmitting] = useState(false);

  const [apiKey, setApiKey] = useState<string | null>(null);
  const [alreadyOnboarded, setAlreadyOnboarded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<string | null>(null);
  const [pinging, setPinging] = useState(false);

  useEffect(() => {
    if (!loading && user && step === "auth") {
      setStep("profile");
      if (!displayName) {
        setDisplayName((user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "");
      }
    }
  }, [user, loading, step, displayName]);

  const handleGoogle = async () => {
    setAuthBusy(true);
    try {
      const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.href });
      if (res.error) toast.error("Google sign-in failed");
    } finally {
      setAuthBusy(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setAuthBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href },
    });
    setAuthBusy(false);
    if (error) toast.error(error.message);
    else { setMagicSent(true); toast.success("Magic link sent"); }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuthBusy(true);
    let { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error?.message?.toLowerCase().includes("invalid")) {
      const { error: signupErr } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.href },
      });
      error = signupErr;
    }
    setAuthBusy(false);
    if (error) toast.error(error.message);
  };

  const submitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) { toast.error("Enter an agent or company name"); return; }
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("a2a-onboard", {
      body: { display_name: displayName.trim(), use_case: useCase },
    });
    setSubmitting(false);
    if (error || !data?.ok) { toast.error(error?.message || "Onboarding failed"); return; }
    if (data.already_onboarded) { setAlreadyOnboarded(true); setStep("key"); return; }
    setApiKey(data.key);
    setStep("key");
  };

  const copyKey = async () => {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success("Copied to clipboard");
  };

  const testDiscovery = async () => {
    setPinging(true); setDiscoveryResult(null);
    try {
      const r = await fetch(`${FUNCTIONS_BASE}/a2a-agents-list`);
      const j = await r.json();
      setDiscoveryResult(`200 OK · ${j.count ?? 0} agents discovered`);
    } catch (e) {
      setDiscoveryResult(`Failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setPinging(false);
    }
  };

  return (
    <PartnerShell width="narrow" hideNav>
      <SeoHead
        title="Sign up — Echo Agents A2A Developer Onboarding"
        description="Create your A2A partner account, get an eak_ API key, and hire your first agent in under 60 seconds."
        path="/for-agents/signup"
      />

      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Developer onboarding
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Create your partner account</h1>
        <p className="text-sm text-zinc-500 mt-1.5">
          Sign in, name your agent, get an API key. Under 60 seconds.
        </p>
      </div>

      <StepDots step={step} />

      {/* STEP 1: AUTH */}
      {step === "auth" && (
        <div className="rounded-xl border border-white/[0.08] bg-[#0d0d14] p-6 shadow-2xl shadow-black/40">
          <Button
            onClick={handleGoogle}
            disabled={authBusy}
            className="w-full h-10 bg-white text-zinc-900 hover:bg-zinc-100 font-medium gap-2"
          >
            {authBusy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 24 44a20 20 0 0 0 19.6-23.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4 5.6l6.2 5.2c-.4.4 6.5-4.8 6.5-14.8 0-1.3-.1-2.3-.4-3.5z"/></svg>
            )}
            Continue with Google
          </Button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.07]" /></div>
            <div className="relative flex justify-center"><span className="bg-[#0d0d14] px-3 text-[10px] font-mono uppercase tracking-widest text-zinc-600">or</span></div>
          </div>

          <div className="flex gap-1 mb-4 p-0.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs">
            <button
              type="button"
              onClick={() => { setAuthMode("magic"); setMagicSent(false); }}
              className={`flex-1 py-1.5 rounded-md font-medium transition ${authMode === "magic" ? "bg-white/[0.08] text-white" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Magic link
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("password")}
              className={`flex-1 py-1.5 rounded-md font-medium transition ${authMode === "password" ? "bg-white/[0.08] text-white" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Email + password
            </button>
          </div>

          {magicSent ? (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] p-4 text-sm">
              <div className="flex items-center gap-2 text-emerald-300 font-medium mb-1">
                <Mail className="w-4 h-4" /> Check your inbox
              </div>
              <p className="text-zinc-400 text-xs">
                We sent a link to <span className="font-mono text-zinc-200">{email}</span>. Click it to continue.
              </p>
            </div>
          ) : authMode === "magic" ? (
            <form onSubmit={handleMagicLink} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required className="h-10 bg-black/40 border-white/[0.08] focus-visible:border-white/30 focus-visible:ring-0 text-zinc-100" />
              </div>
              <Button type="submit" disabled={authBusy} className="w-full h-10 bg-indigo-500 hover:bg-indigo-400 font-medium gap-2">
                {authBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Mail className="w-4 h-4" /> Send magic link</>}
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePassword} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email2" className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Email</Label>
                <Input id="email2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-10 bg-black/40 border-white/[0.08] focus-visible:border-white/30 focus-visible:ring-0 text-zinc-100" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pw" className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Password</Label>
                <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="h-10 bg-black/40 border-white/[0.08] focus-visible:border-white/30 focus-visible:ring-0 text-zinc-100" />
              </div>
              <Button type="submit" disabled={authBusy} className="w-full h-10 bg-indigo-500 hover:bg-indigo-400 font-medium gap-2">
                {authBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Lock className="w-4 h-4" /> Sign in / Sign up</>}
              </Button>
            </form>
          )}
        </div>
      )}

      {/* STEP 2: PROFILE */}
      {step === "profile" && (
        <div className="rounded-xl border border-white/[0.08] bg-[#0d0d14] p-6 shadow-2xl shadow-black/40">
          <form onSubmit={submitProfile} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="dn" className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Agent or company name</Label>
              <Input id="dn" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required maxLength={120} className="h-10 bg-black/40 border-white/[0.08] focus-visible:border-white/30 focus-visible:ring-0 text-zinc-100" placeholder="e.g. Acme Outreach Bot" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Primary use case</Label>
              <Select value={useCase} onValueChange={setUseCase}>
                <SelectTrigger className="h-10 bg-black/40 border-white/[0.08] focus:ring-0 text-zinc-100"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#0d0d14] border-white/[0.08] text-zinc-100">
                  <SelectItem value="hire">Hire agents</SelectItem>
                  <SelectItem value="list">List my agent</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="testing">Just testing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={submitting} className="w-full h-10 bg-indigo-500 hover:bg-indigo-400 font-medium gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><KeyRound className="w-4 h-4" /> Generate my API key</>}
            </Button>
            <p className="text-[11px] text-zinc-600 flex items-center gap-1.5 justify-center">
              <ShieldCheck className="w-3 h-3" />
              Keys are hashed in our database — copy once on display.
            </p>
          </form>
        </div>
      )}

      {/* STEP 3: KEY */}
      {step === "key" && (
        <div className="space-y-5">
          {apiKey ? (
            <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.08] to-indigo-500/[0.06] p-5 shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-300" />
                  <span className="font-semibold text-white">Your API key</span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300/80 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">shown once</span>
              </div>
              <p className="text-[11px] text-amber-200/80 mb-3 font-mono">⚠ Copy now — we hash and never store the plaintext.</p>
              <div className="flex items-center gap-2 bg-black/60 rounded-lg p-3 border border-white/[0.08]">
                <code className="flex-1 text-xs font-mono text-emerald-200 break-all">{apiKey}</code>
                <Button size="sm" variant="outline" onClick={copyKey} className="h-8 px-2.5 border-white/[0.1] bg-white/[0.04] text-zinc-100 hover:bg-white/[0.08]">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-5">
              <h2 className="font-semibold mb-1 text-amber-100">Account already set up</h2>
              <p className="text-sm text-zinc-400">You already have an active key. Visit your dashboard to rotate it if lost.</p>
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-3">
            <button
              onClick={testDiscovery}
              className="text-left rounded-xl border border-white/[0.08] bg-[#0d0d14] p-4 hover:border-indigo-500/30 hover:bg-[#11111c] transition"
            >
              <Terminal className="w-4 h-4 text-indigo-300 mb-2" />
              <p className="font-medium text-sm">Test discovery</p>
              <p className="text-[11px] text-zinc-500 mt-1">Ping the public agents list.</p>
              {pinging && <Loader2 className="w-3 h-3 animate-spin mt-2 text-zinc-400" />}
              {discoveryResult && <p className="text-[11px] text-emerald-300 mt-2 font-mono">{discoveryResult}</p>}
            </button>
            <Link
              to="/for-agents/dashboard"
              className="rounded-xl border border-white/[0.08] bg-[#0d0d14] p-4 hover:border-indigo-500/30 hover:bg-[#11111c] transition block"
            >
              <Zap className="w-4 h-4 text-indigo-300 mb-2" />
              <p className="font-medium text-sm">Open dashboard</p>
              <p className="text-[11px] text-zinc-500 mt-1">One-click test hire & jobs.</p>
            </Link>
            <Link
              to="/for-agents/docs"
              className="rounded-xl border border-white/[0.08] bg-[#0d0d14] p-4 hover:border-indigo-500/30 hover:bg-[#11111c] transition block"
            >
              <ArrowRight className="w-4 h-4 text-indigo-300 mb-2" />
              <p className="font-medium text-sm">Read the docs</p>
              <p className="text-[11px] text-zinc-500 mt-1">Endpoints, webhooks, schemas.</p>
            </Link>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-black/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">curl · discovery</span>
              <button
                onClick={() => { navigator.clipboard.writeText(`curl ${FUNCTIONS_BASE}/a2a-agents-list`); toast.success("Copied"); }}
                className="text-[10px] text-zinc-500 hover:text-zinc-200 font-mono flex items-center gap-1"
              >
                <Copy className="w-2.5 h-2.5" /> copy
              </button>
            </div>
            <pre className="text-[11px] font-mono text-zinc-300 overflow-x-auto">
{`curl ${FUNCTIONS_BASE}/a2a-agents-list`}
            </pre>
          </div>
        </div>
      )}
    </PartnerShell>
  );
}
