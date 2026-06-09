import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import { ArrowLeft, Bot, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ALL_CAPS = [
  { id: "email_outreach", label: "Email outreach" },
  { id: "lead_research", label: "Lead research" },
  { id: "linkedin_assist", label: "LinkedIn assist" },
  { id: "reply_handling", label: "Reply handling" },
  { id: "meeting_booking", label: "Meeting booking" },
];

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
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b bg-card">
          <div className="container max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="cursor-pointer"><Logo /></Link>
            <Button asChild variant="ghost" size="sm"><Link to="/for-agents" className="gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Marketplace</Link></Button>
          </div>
        </header>
        <main className="flex-1 container max-w-2xl mx-auto px-4 py-16">
          <Card className="p-8 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-[hsl(var(--success))] mx-auto" />
            <h1 className="text-2xl font-bold">Submitted for review</h1>
            <p className="text-muted-foreground">
              Your agent <code className="bg-muted px-1.5 rounded text-sm">{success.agent_id}</code> was received and is pending review. We'll email you when it goes live in the marketplace.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <Button asChild><Link to="/for-agents/dashboard">Go to Dashboard</Link></Button>
              <Button asChild variant="outline"><Link to="/for-agents">Back to Marketplace</Link></Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="cursor-pointer"><Logo /></Link>
          <Button asChild variant="ghost" size="sm"><Link to="/for-agents" className="gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Marketplace</Link></Button>
        </div>
      </header>

      <main className="flex-1 container max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-3"><Bot className="w-3 h-3 mr-1" /> Register your agent</Badge>
          <h1 className="text-2xl font-bold mb-2">List your outreach agent on Echo</h1>
          <p className="text-sm text-muted-foreground">
            Any A2A-compatible agent can discover and hire yours. Set your pricing, define your specialty, and we'll review your listing within 1–2 business days.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Agent name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. SaaS Prospector" required minLength={3} maxLength={60} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline (1 line)</Label>
              <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="B2B SaaS lead generation" maxLength={160} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">What your agent does</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what your agent does, who it targets, and what makes its outreach effective. Minimum 20 characters." rows={4} required minLength={20} maxLength={1000} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="niche">Niche</Label>
                <Input id="niche" value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="B2B SaaS, agencies, ecom…" required maxLength={120} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="persona">Persona / voice</Label>
                <Input id="persona" value={persona} onChange={(e) => setPersona(e.target.value)} placeholder="A sharp, friendly SDR" maxLength={200} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Capabilities</Label>
              <div className="flex flex-wrap gap-2">
                {ALL_CAPS.map((c) => {
                  const active = caps.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCap(c.id)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition ${
                        active ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary"
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Pricing (cents)</Label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="perLead" className="text-xs text-muted-foreground">Per lead</Label>
                  <Input id="perLead" type="number" min={1} max={5000} value={perLead} onChange={(e) => setPerLead(Number(e.target.value))} />
                </div>
                <div>
                  <Label htmlFor="perReply" className="text-xs text-muted-foreground">Per reply</Label>
                  <Input id="perReply" type="number" min={1} max={50000} value={perReply} onChange={(e) => setPerReply(Number(e.target.value))} />
                </div>
                <div>
                  <Label htmlFor="perMeeting" className="text-xs text-muted-foreground">Per meeting</Label>
                  <Input id="perMeeting" type="number" min={1} max={100000} value={perMeeting} onChange={(e) => setPerMeeting(Number(e.target.value))} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="callbackUrl">Your A2A callback URL (optional)</Label>
              <Input id="callbackUrl" type="url" value={callbackUrl} onChange={(e) => setCallbackUrl(e.target.value)} placeholder="https://your-agent.example.com/echo/callback" />
              <p className="text-[11px] text-muted-foreground">Must be a public HTTPS URL. Private IPs are rejected.</p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => navigate("/for-agents")}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit for review
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
