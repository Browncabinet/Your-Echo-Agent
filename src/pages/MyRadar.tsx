import { useEffect, useState } from "react";
import { PartnerShell } from "@/components/PartnerShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { downloadICS, type DiscoverOpportunity } from "@/lib/ics";
import { CalendarPlus, ExternalLink, Trash2, Radar } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Row = {
  id: string;
  status: string;
  remind_at: string | null;
  opportunity: DiscoverOpportunity;
};

export default function MyRadar() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("radar_items")
      .select("id, status, remind_at, opportunity:discovered_opportunities(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setRows(((data || []) as unknown as Row[]).filter((r) => r.opportunity));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id]);

  const remove = async (id: string) => {
    const { error } = await supabase.from("radar_items").delete().eq("id", id);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    setRows((rs) => rs.filter((r) => r.id !== id));
  };

  const upcoming = rows.filter((r) => r.opportunity.event_start && new Date(r.opportunity.event_start) > new Date())
    .sort((a, b) => new Date(a.opportunity.event_start!).getTime() - new Date(b.opportunity.event_start!).getTime());

  return (
    <PartnerShell width="wide">
      <div className="container mx-auto py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Radar className="w-7 h-7 text-primary" /> My Radar
          </h1>
          <p className="text-muted-foreground mt-1">Saved opportunities and upcoming events.</p>
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Upcoming</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming saved events.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {upcoming.map((r) => (
                <Card key={r.id}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="shrink-0 text-center w-14">
                      <div className="text-xs uppercase text-muted-foreground">
                        {new Date(r.opportunity.event_start!).toLocaleDateString(undefined, { month: "short" })}
                      </div>
                      <div className="text-2xl font-bold">
                        {new Date(r.opportunity.event_start!).getDate()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <a href={r.opportunity.url} target="_blank" rel="noreferrer" className="font-medium hover:underline truncate inline-flex items-center gap-1">
                        {r.opportunity.title} <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                      <div className="text-xs text-muted-foreground">{r.opportunity.host_org || r.opportunity.source}</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => downloadICS(r.opportunity)}>
                      <CalendarPlus className="w-3.5 h-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">All saved</h2>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fit</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">Nothing on your radar yet.</TableCell></TableRow>
                ) : rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="max-w-xs truncate">
                      <a href={r.opportunity.url} target="_blank" rel="noreferrer" className="hover:underline">{r.opportunity.title}</a>
                    </TableCell>
                    <TableCell><Badge variant="outline">{r.opportunity.kind}</Badge></TableCell>
                    <TableCell>{r.opportunity.event_start ? new Date(r.opportunity.event_start).toLocaleDateString() : "—"}</TableCell>
                    <TableCell><Badge variant="secondary">{r.status}</Badge></TableCell>
                    <TableCell>{r.opportunity.fit_score}</TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>
      </div>
    </PartnerShell>
  );
}
