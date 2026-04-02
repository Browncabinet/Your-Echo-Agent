import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, CheckCheck } from "lucide-react";
import { type Campaign } from "@/lib/campaign-data";

type Props = {
  campaign: Campaign;
  onUpdate: (c: Partial<Campaign>) => void;
  onSend: () => void;
  onBack: () => void;
};

export function ReviewApproval({ campaign, onUpdate, onSend, onBack }: Props) {
  const toggleLead = (id: string) => {
    const leads = campaign.leads.map((l) =>
      l.id === id ? { ...l, approved: !l.approved } : l
    );
    onUpdate({ leads });
  };

  const toggleAll = () => {
    const allApproved = campaign.leads.every((l) => l.approved);
    const leads = campaign.leads.map((l) => ({ ...l, approved: !allApproved }));
    onUpdate({ leads });
  };

  const approvedCount = campaign.leads.filter((l) => l.approved).length;
  const allApproved = campaign.leads.length > 0 && campaign.leads.every((l) => l.approved);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Review & Approve</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Check the leads you want to send to. {approvedCount}/{campaign.leads.length} approved.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox checked={allApproved} onCheckedChange={toggleAll} />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subject</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaign.leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <Checkbox
                      checked={lead.approved}
                      onCheckedChange={() => toggleLead(lead.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell className="text-muted-foreground">{lead.company}</TableCell>
                  <TableCell className="text-sm">{lead.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {campaign.emails[0]?.subject.replace("{{company}}", lead.company) || "—"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="p-4 bg-secondary/50 border-primary/10">
        <div className="flex items-start gap-3">
          <CheckCheck className="w-5 h-5 text-primary mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Safe Sending Defaults</p>
            <p className="text-muted-foreground mt-1">
              • Rate limited to 15-20 emails/day for warmup<br />
              • Auto-added unsubscribe link & physical address<br />
              • Connect via SMTP or Gmail API in settings
            </p>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onSend} disabled={approvedCount === 0} size="lg" className="gap-2">
          <Send className="w-4 h-4" /> Approve & Send ({approvedCount})
        </Button>
      </div>
    </div>
  );
}
