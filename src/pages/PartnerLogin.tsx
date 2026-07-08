import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PartnerShell } from "@/components/PartnerShell";
import { SeoHead } from "@/components/SeoHead";
import { Loader2, Mail, ArrowRight, Lock } from "lucide-react";
import { toast } from "sonner";

export default function PartnerLogin() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate("/for-agents/dashboard", { replace: true });
  }, [user, loading, navigate]);

  const onGoogle = async () => {
    setBusy(true);
    try {
      const res = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/for-agents/dashboard`,
      });
      if (res.error) toast.error("Google sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  const onMagic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/for-agents/dashboard` },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      setMagicSent(true);
      toast.success("Magic link sent");
    }
  };

  const onPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
  };

  return (
    <PartnerShell width="narrow" hideNav>
      <SeoHead
        title="Log in — Your Echo A2A"
        description="Sign in to your A2A partner account to manage API keys, jobs, and billing."
        path="/for-agents/login"
      />

      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-zinc-500 mt-1.5">
          Log in to your A2A partner account
        </p>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-[#0d0d14] p-6 shadow-2xl shadow-black/40">
        <Button
          onClick={onGoogle}
          disabled={busy}
          className="w-full h-10 bg-white text-zinc-900 hover:bg-zinc-100 font-medium gap-2"
        >
          {busy ? (
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
            onClick={() => setMode("magic")}
            className={`flex-1 py-1.5 rounded-md font-medium transition ${mode === "magic" ? "bg-white/[0.08] text-white" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            Magic link
          </button>
          <button
            type="button"
            onClick={() => setMode("password")}
            className={`flex-1 py-1.5 rounded-md font-medium transition ${mode === "password" ? "bg-white/[0.08] text-white" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            Password
          </button>
        </div>

        {magicSent ? (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] p-4 text-sm">
            <div className="flex items-center gap-2 text-emerald-300 font-medium mb-1">
              <Mail className="w-4 h-4" /> Check your inbox
            </div>
            <p className="text-zinc-400 text-xs">
              We sent a sign-in link to <span className="font-mono text-zinc-200">{email}</span>. It expires in 1 hour.
            </p>
          </div>
        ) : mode === "magic" ? (
          <form onSubmit={onMagic} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="h-10 bg-black/40 border-white/[0.08] focus-visible:border-white/30 focus-visible:ring-0 text-zinc-100"
              />
            </div>
            <Button type="submit" disabled={busy} className="w-full h-10 bg-indigo-500 hover:bg-indigo-400 text-white font-medium gap-2">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Mail className="w-4 h-4" /> Send magic link</>}
            </Button>
          </form>
        ) : (
          <form onSubmit={onPassword} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email2" className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Email</Label>
              <Input
                id="email2"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 bg-black/40 border-white/[0.08] focus-visible:border-white/30 focus-visible:ring-0 text-zinc-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw" className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Password</Label>
              <Input
                id="pw"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="h-10 bg-black/40 border-white/[0.08] focus-visible:border-white/30 focus-visible:ring-0 text-zinc-100"
              />
            </div>
            <Button type="submit" disabled={busy} className="w-full h-10 bg-indigo-500 hover:bg-indigo-400 text-white font-medium gap-2">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Lock className="w-4 h-4" /> Sign in</>}
            </Button>
          </form>
        )}
      </div>

      <div className="text-center mt-6 text-sm text-zinc-500">
        New to Your Echo?{" "}
        <Link to="/for-agents/signup" className="text-white hover:text-indigo-300 font-medium inline-flex items-center gap-1">
          Create an account <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <p className="text-center text-[11px] text-zinc-600 mt-8 font-mono">
        No credit card required · Free API key on signup
      </p>
    </PartnerShell>
  );
}
