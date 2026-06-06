import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Send = {
  id: string;
  lead_email: string;
  lead_name: string;
  status: string;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  error_message: string | null;
  variant: string | null;
};

type Row = Send & {
  derivedStatus: "replied" | "clicked" | "opened" | "failed" | "sent" | "queued";
  lastActivity: string | null;
  replyAt: string | null;
};

const PAGE_SIZE = 25;

const STATUS_STYLE: Record<Row["derivedStatus"], string> = {
  replied: "bg-accent text-accent-foreground",
  clicked: "bg-success-light text-success",
  opened: "bg-secondary text-secondary-foreground",
  failed: "bg-destructive/10 text-destructive",
  sent: "bg-primary/10 text-primary",
  queued: "bg-muted text-muted-foreground",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function csvEscape(v: any) {
  const s = v == null ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function RecipientsTable({ campaignId, campaignName }: { campaignId: string; campaignName: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [sendsRes, repliesRes] = await Promise.all([
        supabase
          .from("campaign_sends")
          .select("id, lead_email, lead_name, status, sent_at, opened_at, clicked_at, error_message, variant")
          .eq("campaign_id", campaignId),
        supabase
          .from("email_replies")
          .select("lead_email, received_at")
          .eq("campaign_id", campaignId),
      ]);

      if (cancelled) return;

      const replyMap = new Map<string, string>();
      (repliesRes.data || []).forEach((r: any) => {
        if (!r.lead_email) return;
        const prev = replyMap.get(r.lead_email);
        if (!prev || new Date(r.received_at) > new Date(prev)) {
          replyMap.set(r.lead_email, r.received_at);
        }
      });

      const computed: Row[] = (sendsRes.data || []).map((s: any) => {
        const replyAt = replyMap.get(s.lead_email) ?? null;
        let derivedStatus: Row["derivedStatus"] = "queued";
        if (replyAt) derivedStatus = "replied";
        else if (s.clicked_at) derivedStatus = "clicked";
        else if (s.opened_at) derivedStatus = "opened";
        else if (s.status === "failed") derivedStatus = "failed";
        else if (s.status === "sent") derivedStatus = "sent";

        const candidates = [replyAt, s.clicked_at, s.opened_at, s.sent_at].filter(Boolean) as string[];
        const lastActivity = candidates.length
          ? candidates.reduce((a, b) => (new Date(a) > new Date(b) ? a : b))
          : null;

        return { ...s, derivedStatus, lastActivity, replyAt };
      });

      computed.sort((a, b) => {
        const ta = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
        const tb = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
        return tb - ta;
      });

      setRows(computed);
      setLoading(false);
    };

    load();

    const channel = supabase
      .channel(`recipients:${campaignId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "campaign_sends", filter: `campaign_id=eq.${campaignId}` },
        () => load()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "email_replies", filter: `campaign_id=eq.${campaignId}` },
        () => load()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [campaignId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.lead_email.toLowerCase().includes(q) ||
        (r.lead_name || "").toLowerCase().includes(q)
    );
  }, [rows, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const exportCsv = () => {
    const header = [
      "Name",
      "Email",
      "Variant",
      "Send Status",
      "Reply Status",
      "Opened At",
      "Clicked At",
      "Sent At",
      "Last Activity",
      "Error Message",
    ];
    const lines = [header.join(",")];
    filtered.forEach((r) => {
      lines.push(
        [
          csvEscape(r.lead_name),
          csvEscape(r.lead_email),
          csvEscape(r.variant ?? ""),
          csvEscape(r.status),
          csvEscape(r.replyAt ? "Replied" : "No reply"),
          csvEscape(r.opened_at ?? ""),
          csvEscape(r.clicked_at ?? ""),
          csvEscape(r.sent_at ?? ""),
          csvEscape(r.lastActivity ?? ""),
          csvEscape(r.error_message ?? ""),
        ].join(",")
      );
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(campaignName || "campaign").replace(/[^\w-]+/g, "_")}_recipients.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Recipients</h3>
          <Badge variant="secondary" className="text-[10px]">{rows.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search name or email"
              className="h-8 pl-7 text-xs w-56"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="h-8 gap-1.5 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading recipients…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No recipients yet — they'll appear here as soon as sending begins.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="py-2 px-2 font-medium">Lead</th>
                  <th className="py-2 px-2 font-medium">Email</th>
                  <th className="py-2 px-2 font-medium">Status</th>
                  <th className="py-2 px-2 font-medium">Sent</th>
                  <th className="py-2 px-2 font-medium">Last activity</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 last:border-0">
                    <td className="py-2 px-2 text-foreground">{r.lead_name || "—"}</td>
                    <td className="py-2 px-2 text-muted-foreground truncate max-w-[220px]">
                      {r.lead_email}
                    </td>
                    <td className="py-2 px-2">
                      <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full ${STATUS_STYLE[r.derivedStatus]}`}>
                        {r.derivedStatus}
                      </span>
                      {r.derivedStatus === "failed" && r.error_message && (
                        <p className="text-[10px] text-destructive mt-1 line-clamp-1">
                          {r.error_message}
                        </p>
                      )}
                    </td>
                    <td className="py-2 px-2 text-muted-foreground text-xs">
                      {formatDate(r.sent_at)}
                    </td>
                    <td className="py-2 px-2 text-muted-foreground text-xs">
                      {formatDate(r.lastActivity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pageCount > 1 && (
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span>
                Page {safePage + 1} of {pageCount} · {filtered.length} shown
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  disabled={safePage === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  disabled={safePage >= pageCount - 1}
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
