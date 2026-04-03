import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FlaskConical, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { type Campaign } from "@/lib/campaign-data";

interface ABTestingCardProps {
  campaign: Campaign;
}

export function ABTestingCard({ campaign }: ABTestingCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Find emails that have a B variant
  const abEmails = campaign.emails.filter((e) => e.subjectB);

  if (abEmails.length === 0) {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <FlaskConical className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">A/B Subject Testing</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          No A/B tests running yet. Add a "Subject B" variant in the Email Builder to start testing.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">A/B Subject Testing</h3>
          <Badge variant="secondary" className="text-[10px]">
            {abEmails.length} test{abEmails.length > 1 ? "s" : ""}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="h-7 w-7 p-0"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      {/* Always show first test as preview */}
      <ABTestRow email={abEmails[0]} index={0} />

      {/* Show rest when expanded */}
      {expanded &&
        abEmails.slice(1).map((email, i) => (
          <div key={email.id} className="mt-4 pt-4 border-t border-border">
            <ABTestRow email={email} index={i + 1} />
          </div>
        ))}
    </Card>
  );
}

function ABTestRow({
  email,
  index,
}: {
  email: { id: string; subject: string; subjectB?: string; type: string; openRateA?: number; openRateB?: number };
  index: number;
}) {
  const hasData = typeof email.openRateA === "number" && typeof email.openRateB === "number";

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground font-medium">
        Test #{index + 1} — {email.type === "initial" ? "Initial Email" : "Follow-up"}
      </p>

      {!hasData ? (
        <div className="space-y-2">
          <VariantLabel letter="A" subject={email.subject} />
          <VariantLabel letter="B" subject={email.subjectB} />
          <p className="text-xs text-muted-foreground italic mt-1">
            Waiting for results… Data will appear once emails are sent and opened.
          </p>
        </div>
      ) : (
        <>
          {/* Variant A */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={email.openRateA! >= email.openRateB! ? "default" : "outline"} className="text-[10px] h-5">A</Badge>
                <span className="text-sm text-foreground truncate max-w-[280px]">{email.subject}</span>
                {email.openRateA! >= email.openRateB! && <Trophy className="w-3 h-3 text-warning" />}
              </div>
              <span className="text-xs font-medium text-muted-foreground">{email.openRateA}% open</span>
            </div>
            <Progress value={email.openRateA} className="h-2" />
          </div>

          {/* Variant B */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={email.openRateB! > email.openRateA! ? "default" : "outline"} className="text-[10px] h-5">B</Badge>
                <span className="text-sm text-foreground truncate max-w-[280px]">{email.subjectB}</span>
                {email.openRateB! > email.openRateA! && <Trophy className="w-3 h-3 text-warning" />}
              </div>
              <span className="text-xs font-medium text-muted-foreground">{email.openRateB}% open</span>
            </div>
            <Progress value={email.openRateB} className="h-2" />
          </div>
        </>
      )}
    </div>
  );
}

function VariantLabel({ letter, subject }: { letter: string; subject?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="text-[10px] h-5">{letter}</Badge>
      <span className="text-sm text-foreground truncate max-w-[280px]">{subject || "—"}</span>
    </div>
  );
}
