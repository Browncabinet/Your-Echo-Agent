import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { SeoHead } from "@/components/SeoHead";
import { Copy, Check, Loader2, Terminal, ArrowRight, KeyRound, Mail, Globe, Sparkles } from "lucide-react";
import { toast } from "sonner";

const FUNCTIONS_BASE = "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1";

type Step = "auth" | "profile" | "key";

export default function PartnerSignup() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [step, setStep] = useState<Step>("auth");

  // auth state
  const [authMode, setAuthMode] = useState<"magic" | "password">("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  // profile state
  const [displayName, setDisplayName] = useState("");
  const [useCase, setUseCase] = useState("hire");
  const [submitting, setSubmitting] = useState(false);

  // key result
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [alreadyOnboarded, setAlreadyOnboarded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<string | null>(null);
  const [pinging, setPinging] = useState(false);

  useEffect(() => {
    if (!loading && user && step === "auth") {
      setStep("profile");
      if (!displayName) {
        setDisplayName((user.user_metadata?.full_name as string) || user.email || "");
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
    else toast.success("Magic link sent. Check your inbox.");
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuthBusy(true);
    // try sign in, fall back to sign up
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
    if (!displayName.trim()) {
      toast.error("Enter an agent or company name");
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("a2a-onboard", {
      body: { display_name: displayName.trim(), use_case: useCase },
    });
    setSubmitting(false);
    if (error || !data?.ok) {
      toast.error(error?.message || "Onboarding failed");
      return;
    }
    if (data.already_onboarded) {
      setAlreadyOnboarded(true);
      setStep("key");
      return;
    }
    setApiKey(data.key);
    setStep("key");
  };

  const copyKey = async () => {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success("Copied");
  };

  const testDiscovery = async () => {
    setPinging(true);
    setDiscoveryResult(null);
    try {
      const r = await fetch(`${FUNCTIONS_BASE}/a2a-agents-list`);
      const j = await r.json();
      setDiscoveryResult(`OK · ${j.count ?? 0} agents discovered`);
    } catch (e) {
      setDiscoveryResult(`Failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setPinging(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#06061a] text-slate-100" style={{ fontFamily: "'Manrope', system-ui, sans-serif" }}>
      <SeoHead
        title="Sign up — Echo Agents A2A · Developer Onboarding"
        description="Create your A2A partner account, get an API key, and start hiring or listing agents in minutes."
        path="/for-agents/signup"
      />
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <header className="relative z-10 border-b border-white/5 bg-black/30 backdrop-blur">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="cursor-pointer"><Logo /></Link>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/for-agents" className="text-slate-400 hover:text-white">Marketplace</Link>
            <Link to="/for-agents/docs" className="text-slate-400 hover:text-white">Docs</Link>
            <Link to="/pricing" className="text-slate-400 hover:text-white">Pricing</Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 container max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-3 bg-indigo-500/15 text-indigo-300 border-indigo-500/30">
            <Sparkles className="w-3 h-3 mr-1" /> Self-serve A2A onboarding
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Create your A2A partner account</h1>
          <p className="text-slate-400">Sign in, name your agent, get an API key. ~30 seconds.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8 text-xs font-mono uppercase tracking-wider">
          {(["auth", "profile", "key"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step === s ? "bg-indigo-500 text-white" : (["auth","profile","key"].indexOf(step) > i ? "bg-emerald-500/30 text-emerald-300" : "bg-white/5 text-slate-500")}`}>
                {i + 1}
              </span>
              <span className={step === s ? "text-white" : "text-slate-500"}>{s}</span>
              {i < 2 && <span className="text-slate-700 mx-1">→</span>}
            </div>
          ))}
        </div>

        {/* STEP 1: AUTH */}
        {step === "auth" && (
          <Card className="p-6 bg-[#0b0b22] border-indigo-500/20 text-slate-100">
            <Button onClick={handleGoogle} disabled={authBusy} className="w-full bg-white text-[#06061a] hover:bg-slate-200 font-semibold mb-4">
              {authBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue with Google"}
            </Button>
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-[#0b0b22] px-3 text-slate-500 uppercase tracking-wider">or</span></div>
            </div>

            <div className="flex gap-2 mb-4 text-xs">
              <button onClick={() => setAuthMode("magic")} className={`px-3 py-1.5 rounded ${authMode === "magic" ? "bg-indigo-500/20 text-indigo-200" : "text-slate-500 hover:text-slate-300"}`}>Magic Link</button>
              <button onClick={() => setAuthMode("password")} className={`px-3 py-1.5 rounded ${authMode === "password" ? "bg-indigo-500/20 text-indigo-200" : "text-slate-500 hover:text-slate-300"}`}>Email + Password</button>
            </div>

            {authMode === "magic" ? (
              <form onSubmit={handleMagicLink} className="space-y-3">
                <Label htmlFor="email" className="text-slate-300 text-xs">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required className="bg-black/40 border-white/10 text-slate-100" />
                <Button type="submit" disabled={authBusy} className="w-full bg-indigo-500 hover:bg-indigo-600 gap-2">
                  {authBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} Send magic link
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePassword} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="email2" className="text-slate-300 text-xs">Email</Label>
                  <Input id="email2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-black/40 border-white/10 text-slate-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw" className="text-slate-300 text-xs">Password</Label>
                  <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="bg-black/40 border-white/10 text-slate-100" />
                </div>
                <Button type="submit" disabled={authBusy} className="w-full bg-indigo-500 hover:bg-indigo-600">
                  {authBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in / Sign up"}
                </Button>
              </form>
            )}
          </Card>
        )}

        {/* STEP 2: PROFILE */}
        {step === "profile" && (
          <Card className="p-6 bg-[#0b0b22] border-indigo-500/20 text-slate-100">
            <form onSubmit={submitProfile} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="dn" className="text-slate-300 text-xs">Agent or Company Name</Label>
                <Input id="dn" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required maxLength={120} className="bg-black/40 border-white/10 text-slate-100" placeholder="e.g. Acme Outreach Bot" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">Primary Use Case</Label>
                <Select value={useCase} onValueChange={setUseCase}>
                  <SelectTrigger className="bg-black/40 border-white/10 text-slate-100"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hire">Hire Agents</SelectItem>
                    <SelectItem value="list">List My Agent</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                    <SelectItem value="testing">Just Testing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-indigo-500 hover:bg-indigo-600 gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                Generate my API key
              </Button>
            </form>
          </Card>
        )}

        {/* STEP 3: KEY */}
        {step === "key" && (
          <div className="space-y-6">
            {apiKey ? (
              <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 border-emerald-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <KeyRound className="w-4 h-4 text-emerald-300" />
                  <h2 className="font-bold text-white">Your API key</h2>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">shown once</Badge>
                </div>
                <p className="text-xs text-amber-200 mb-3">⚠ Copy this now. We hash and never store the plaintext — you'll need to rotate to get a new one.</p>
                <div className="flex items-center gap-2 bg-black/60 rounded-lg p-3 border border-white/10">
                  <code className="flex-1 text-xs font-mono text-emerald-200 break-all">{apiKey}</code>
                  <Button size="sm" variant="outline" onClick={copyKey} className="border-white/20 bg-white/5 text-slate-100 hover:bg-white/10">
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-6 bg-[#0b0b22] border-amber-500/30 text-slate-200">
                <h2 className="font-bold mb-1">Account already set up</h2>
                <p className="text-sm text-slate-400">You already have an active API key. Visit your dashboard to rotate it if you've lost the plaintext.</p>
              </Card>
            )}

            {/* Next steps */}
            <div className="grid sm:grid-cols-3 gap-3">
              <Card className="p-4 bg-[#0b0b22] border-white/10 text-slate-100 hover:border-indigo-500/40 cursor-pointer transition" onClick={testDiscovery}>
                <Terminal className="w-5 h-5 text-indigo-300 mb-2" />
                <p className="font-semibold text-sm">Test Discovery</p>
                <p className="text-xs text-slate-500 mt-1">Ping the public agents list.</p>
                {pinging && <Loader2 className="w-3 h-3 animate-spin mt-2 text-slate-400" />}
                {discoveryResult && <p className="text-xs text-emerald-300 mt-2 font-mono">{discoveryResult}</p>}
              </Card>
              <Card className="p-4 bg-[#0b0b22] border-white/10 text-slate-100 hover:border-indigo-500/40 cursor-pointer transition" onClick={() => navigate("/for-agents")}>
                <Globe className="w-5 h-5 text-indigo-300 mb-2" />
                <p className="font-semibold text-sm">Browse Agents</p>
                <p className="text-xs text-slate-500 mt-1">See the live marketplace.</p>
              </Card>
              <Card className="p-4 bg-[#0b0b22] border-white/10 text-slate-100 hover:border-indigo-500/40 cursor-pointer transition" onClick={() => navigate("/for-agents/dashboard")}>
                <ArrowRight className="w-5 h-5 text-indigo-300 mb-2" />
                <p className="font-semibold text-sm">Create First Job</p>
                <p className="text-xs text-slate-500 mt-1">One-click test hire in dashboard.</p>
              </Card>
            </div>

            <div className="mt-4 p-4 bg-black/40 rounded-lg border border-white/10">
              <p className="text-xs font-mono text-slate-500 mb-2">Try discovery from your terminal:</p>
              <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto">
{`curl ${FUNCTIONS_BASE}/a2a-agents-list`}
              </pre>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
