export type DiscoverOpportunity = {
  id: string;
  kind: "group" | "conference" | "webinar" | "podcast" | "newsletter" | "forum";
  title: string;
  url: string;
  host_org: string | null;
  location: string | null;
  is_virtual: boolean;
  event_start: string | null;
  source: string | null;
  contacts: Array<{ name?: string; role?: string; email?: string; linkedin?: string; twitter?: string; score?: number; verification?: string; enriched_at?: string }>;
  fit_score: number;
  fit_reason: string | null;
  approach?: string | null;
  approach_reason?: string | null;
  engagement_hint?: string | null;
  draft_subject?: string | null;
  draft_body?: string | null;
  draft_generated_at?: string | null;
  status: string;
  created_at: string;
};

function pad(n: number) { return n.toString().padStart(2, "0"); }
function toICSDate(iso: string) {
  const d = new Date(iso);
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    "00Z"
  );
}

export function buildICS(opp: DiscoverOpportunity): string {
  const start = opp.event_start ? new Date(opp.event_start) : new Date(Date.now() + 24 * 3600 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const esc = (s: string) => s.replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Your Echo Agent//Discover//EN",
    "BEGIN:VEVENT",
    `UID:${opp.id}@yourechoagent`,
    `DTSTAMP:${toICSDate(new Date().toISOString())}`,
    `DTSTART:${toICSDate(start.toISOString())}`,
    `DTEND:${toICSDate(end.toISOString())}`,
    `SUMMARY:${esc(opp.title)}`,
    `DESCRIPTION:${esc((opp.fit_reason || "") + "\n" + opp.url)}`,
    `URL:${opp.url}`,
    opp.location ? `LOCATION:${esc(opp.location)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
}

export function downloadICS(opp: DiscoverOpportunity) {
  const blob = new Blob([buildICS(opp)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${opp.title.replace(/[^a-z0-9]+/gi, "-").slice(0, 60) || "event"}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
