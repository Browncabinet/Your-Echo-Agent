import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Plus, Trash2, Mail } from "lucide-react";
import { type Campaign, type EmailTemplate, generateEmailTemplates, generateId } from "@/lib/campaign-data";

type Props = {
  campaign: Campaign;
  onUpdate: (c: Partial<Campaign>) => void;
  onNext: () => void;
  onBack: () => void;
};

export function EmailBuilder({ campaign, onUpdate, onNext, onBack }: Props) {
  const [emails, setEmails] = useState<EmailTemplate[]>(campaign.emails);

  useEffect(() => {
    if (emails.length === 0) {
      const generated = generateEmailTemplates(campaign.name, campaign.goal);
      setEmails(generated);
      onUpdate({ emails: generated });
    }
  }, []);

  const updateEmail = (id: string, updates: Partial<EmailTemplate>) => {
    const updated = emails.map((e) => (e.id === id ? { ...e, ...updates } : e));
    setEmails(updated);
    onUpdate({ emails: updated });
  };

  const addFollowUp = () => {
    if (emails.filter((e) => e.type === "followup").length >= 3) return;
    const newEmail: EmailTemplate = {
      id: generateId(),
      subject: "Just checking in — {{company}}",
      body: "Hi {{name}},\n\nI wanted to follow up one more time. I believe {{company}} could really benefit from what we offer.\n\nWould a brief call work for you this week?\n\nBest,\n[Your Name]",
      delay: 5,
      type: "followup",
    };
    const updated = [...emails, newEmail];
    setEmails(updated);
    onUpdate({ emails: updated });
  };

  const removeEmail = (id: string) => {
    const updated = emails.filter((e) => e.id !== id);
    setEmails(updated);
    onUpdate({ emails: updated });
  };

  const followUpCount = emails.filter((e) => e.type === "followup").length;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">Build Your Emails</h2>
        <p className="text-sm text-muted-foreground mt-1">
          We've drafted personalized emails. Edit anything you'd like.
        </p>
      </div>

      <div className="space-y-4">
        {emails.map((email, i) => (
          <Card key={email.id} className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">
                  {email.type === "initial" ? "Initial Email" : `Follow-up #${i}`}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {email.type === "initial" ? "Day 1" : `+${email.delay} days`}
                </Badge>
              </div>
              {email.type === "followup" && (
                <Button variant="ghost" size="icon" onClick={() => removeEmail(email.id)}>
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              )}
            </div>

            <div>
              <Label className="text-xs">Subject Line A</Label>
              <Input
                value={email.subject}
                onChange={(e) => updateEmail(email.id, { subject: e.target.value })}
                className="mt-1"
              />
            </div>

            {email.subjectB !== undefined && (
              <div>
                <Label className="text-xs">Subject Line B (A/B test)</Label>
                <Input
                  value={email.subjectB}
                  onChange={(e) => updateEmail(email.id, { subjectB: e.target.value })}
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label className="text-xs">Email Body</Label>
              <Textarea
                value={email.body}
                onChange={(e) => updateEmail(email.id, { body: e.target.value })}
                rows={6}
                className="mt-1 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use {"{{name}}"} and {"{{company}}"} for personalization
              </p>
            </div>

            {email.type === "followup" && (
              <div className="flex items-center gap-2">
                <Label className="text-xs whitespace-nowrap">Send after</Label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={email.delay}
                  onChange={(e) => updateEmail(email.id, { delay: parseInt(e.target.value) || 5 })}
                  className="w-20"
                />
                <span className="text-xs text-muted-foreground">days</span>
              </div>
            )}
          </Card>
        ))}

        {followUpCount < 3 && (
          <Button variant="outline" onClick={addFollowUp} className="gap-2 w-full border-dashed">
            <Plus className="w-4 h-4" /> Add Follow-up ({followUpCount}/3)
          </Button>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} disabled={emails.length === 0} size="lg" className="gap-2">
          Review & Approve <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
