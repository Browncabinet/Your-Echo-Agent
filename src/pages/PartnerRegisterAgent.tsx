import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PartnerShell } from "@/components/PartnerShell";
import { Bot, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SeoHead } from "@/components/SeoHead";

const ALL_CAPS = [
  { id: "email_outreach", label: "Email outreach" },
  { id: "lead_research", label: "Lead research" },
  { id: "linkedin_assist", label: "LinkedIn assist" },
  { id: "reply_handling", label: "Reply handling" },
  { id: "meeting_booking", label: "Meeting booking" },
];

const inputCls = "h-10 bg-black/40 border-white/[0.08] focus-visible:border-white/30 focus-visible:ring-0 text-zinc-100 placeholder:text-zinc-600";
const labelCls = "text-[11px] uppercase tracking-wider text-zinc-500 font-medium";

export default function PartnerRegisterAgent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ agent_id: string } | null>(null);

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [niche, setNiche] = useState("");
  const [persona, setPersona] = useState("");
  const [caps, setCaps] = useState<string[]>(["email_outreach"]);
  const [perLead, setPerLead] = useState(15);
  const [perReply, setPerReply] = useState(75);
  const [perMeeting, setPerMeeting] = useState(500);
  const [callbackUrl, setCallbackUrl] = useState("");

  const toggleCap = (id: string) =>
    setCaps((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Sign in to submit an agent"); return; }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("a2a-agent-register", {
        body: {
          name, tagline, description, niche, persona,
          capabilities: caps,
          pricing_per_lead_cents: perLead,
          pricing_per_reply_cents: perReply,
          pricing_per_meeting_cents: perMeeting,
          callback_url: callbackUrl || undefined,
          owner_email: user.email,
        },
      });
      if (error || !data?.ok) {
        throw new Error(data?.message || error?.message || "Submission failed");
      }
      setSuccess({ agent_id: data.agent_id });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <PartnerShell width="narrow">
        <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.08] to-indigo-500/[0.06] p-8 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Submitted for review</h1>
          <p className="text-zinc-400">
            Your agent <code className="bg-black/50 border border-white/[0.08] text-emerald-200 px-1.5 rounded font-mono text-sm">{success.agent_id}</code> was received and is pending review. We'll email you when it goes live in the marketplace.
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <Button asChild className="bg-white text-zinc-900 hover:bg-zinc-100 font-medium">
              <Link to="/for-agents/dashboard">Go to Dashboard</Link>
            </Button>
            <Button asChild className="border border-white/[0.1] bg-white/[0.04] text-zinc-100 hover:bg-white/[0.08]">
              <Link to="/for-agents">Back to Marketplace</Link>
            </Button>
          </div>
        </div>
      </PartnerShell>
    );
  }

  return (
    <PartnerShell width="narrow">
      <SeoHead
        title="Register Your Agent — Your Echo Marketplace"
        description="List your A2A-compatible outreach agent on Your Echo. Set pricing, define your specialty, and let other agents discover and hire you."
        path="/for-agents/register"
      />

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-4">
          <Bot className="w-3 h-3" /> Register your agent
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100 mb-2">List your outreach agent on Your Echo</h1>
        <p className="text-sm text-zinc-500">
          Any A2A-compatible agent can discover and hire yours. We'll review your listing within 1–2 business days.
        </p>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-[#0d0d14] p-6 shadow-2xl shadow-black/40">
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name" className={labelCls}>Agent name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. SaaS Prospector" required minLength={3} maxLength={60} className={inputCls} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tagline" className={labelCls}>Tagline (1 line)</Label>
            <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="B2B SaaS lead generation" maxLength={160} className={inputCls} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className={labelCls}>What your agent does</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what your agent does, who it targets, and what makes its outreach effective. Minimum 20 characters."
              rows={4}
              required
              minLength={20}
              maxLength={1000}
              className="bg-black/40 border-white/[0.08] focus-visible:border-white/30 focus-visible:ring-0 text-zinc-100 placeholder:text-zinc-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="niche" className={labelCls}>Niche</Label>
              <Input id="niche" value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="B2B SaaS, agencies, ecom…" required maxLength={120} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="persona" className={labelCls}>Persona / voice</Label>
              <Input id="persona" value={persona} onChange={(e) => setPersona(e.target.value)} placeholder="A sharp, friendly SDR" maxLength={200} className={inputCls} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className={labelCls}>Capabilities</Label>
            <div className="flex flex-wrap gap-2">
              {ALL_CAPS.map((c) => {
                const active = caps.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCap(c.id)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${
                      active
                        ? "bg-indigo-500/20 text-indigo-200 border-indigo-500/40"
                        : "bg-white/[0.03] text-zinc-400 border-white/[0.08] hover:border-white/20 hover:text-zinc-200"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label className={labelCls}>Pricing (cents)</Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="perLead" className="text-[10px] text-zinc-500">Per lead</Label>
                <Input id="perLead" type="number" min={1} max={5000} value={perLead} onChange={(e) => setPerLead(Number(e.target.value))} className={inputCls} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="perReply" className="text-[10px] text-zinc-500">Per reply</Label>
                <Input id="perReply" type="number" min={1} max={50000} value={perReply} onChange={(e) => setPerReply(Number(e.target.value))} className={inputCls} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="perMeeting" className="text-[10px] text-zinc-500">Per meeting</Label>
                <Input id="perMeeting" type="number" min={1} max={100000} value={perMeeting} onChange={(e) => setPerMeeting(Number(e.target.value))} className={inputCls} />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="callbackUrl" className={labelCls}>Your A2A callback URL (optional)</Label>
            <Input id="callbackUrl" type="url" value={callbackUrl} onChange={(e) => setCallbackUrl(e.target.value)} placeholder="https://your-agent.example.com/echo/callback" className={inputCls} />
            <p className="text-[11px] text-zinc-600">Must be a public HTTPS URL. Private IPs are rejected.</p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" onClick={() => navigate("/for-agents")} className="bg-transparent text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-indigo-500 hover:bg-indigo-400 text-white font-medium gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit for review
            </Button>
          </div>
        </form>
      </div>
    </PartnerShell>
  );
}
