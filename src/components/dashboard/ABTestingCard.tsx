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
  email: { id: string; subject: string; subjectB?: string; type: string };
  index: number;
}) {
  // Simulated A/B performance (MVP placeholder — replace with real tracking later)
  const aOpen = Math.floor(Math.random() * 30 + 25);
  const bOpen = Math.floor(Math.random() * 30 + 25);
  const winner = aOpen >= bOpen ? "A" : "B";

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground font-medium">
        Test #{index + 1} — {email.type === "initial" ? "Initial Email" : "Follow-up"}
      </p>

      {/* Variant A */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant={winner === "A" ? "default" : "outline"}
              className="text-[10px] h-5"
            >
              A
            </Badge>
            <span className="text-sm text-foreground truncate max-w-[280px]">
              {email.subject}
            </span>
            {winner === "A" && <Trophy className="w-3 h-3 text-warning" />}
          </div>
          <span className="text-xs font-medium text-muted-foreground">{aOpen}% open</span>
        </div>
        <Progress value={aOpen} className="h-2" />
      </div>

      {/* Variant B */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant={winner === "B" ? "default" : "outline"}
              className="text-[10px] h-5"
            >
              B
            </Badge>
            <span className="text-sm text-foreground truncate max-w-[280px]">
              {email.subjectB}
            </span>
            {winner === "B" && <Trophy className="w-3 h-3 text-warning" />}
          </div>
          <span className="text-xs font-medium text-muted-foreground">{bOpen}% open</span>
        </div>
        <Progress value={bOpen} className="h-2" />
      </div>
    </div>
  );
}
