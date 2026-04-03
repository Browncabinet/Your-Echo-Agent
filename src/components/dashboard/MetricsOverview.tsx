import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Mail, Eye, MousePointerClick, MessageSquare } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type MetricData = {
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
};

function MiniDonut({ value, total, color }: { value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const data = [
    { value: pct },
    { value: 100 - pct },
  ];

  return (
    <div className="relative w-16 h-16">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={20}
            outerRadius={28}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="hsl(var(--muted))" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-foreground">
        {pct.toFixed(0)}%
      </span>
    </div>
  );
}

function MetricRow({
  icon: Icon,
  label,
  value,
  total,
  color,
  bgClass,
}: {
  icon: any;
  label: string;
  value: number;
  total: number;
  color: string;
  bgClass: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground">
            {value} / {total} ({pct.toFixed(1)}%)
          </span>
        </div>
        <Progress value={pct} className="h-2" />
      </div>
    </div>
  );
}

export function MetricsOverview({ stats }: { stats: MetricData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Donut overview card */}
      <Card className="p-5 flex flex-col items-center justify-center gap-3 lg:col-span-1">
        <h3 className="text-sm font-semibold text-foreground">Delivery Overview</h3>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <MiniDonut value={stats.opened} total={stats.sent} color="hsl(var(--primary))" />
            <p className="text-[10px] text-muted-foreground mt-1">Open Rate</p>
          </div>
          <div className="text-center">
            <MiniDonut value={stats.clicked} total={stats.sent} color="hsl(var(--success))" />
            <p className="text-[10px] text-muted-foreground mt-1">Click Rate</p>
          </div>
          <div className="text-center">
            <MiniDonut value={stats.replied} total={stats.sent} color="hsl(var(--warning))" />
            <p className="text-[10px] text-muted-foreground mt-1">Reply Rate</p>
          </div>
        </div>
      </Card>

      {/* Progress bars card */}
      <Card className="p-5 lg:col-span-2 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Funnel Breakdown</h3>
        <MetricRow
          icon={Mail}
          label="Sent"
          value={stats.sent}
          total={stats.sent}
          color="hsl(var(--primary))"
          bgClass="bg-primary/10 text-primary"
        />
        <MetricRow
          icon={Eye}
          label="Opened"
          value={stats.opened}
          total={stats.sent}
          color="hsl(var(--primary))"
          bgClass="bg-secondary text-secondary-foreground"
        />
        <MetricRow
          icon={MousePointerClick}
          label="Clicked"
          value={stats.clicked}
          total={stats.sent}
          color="hsl(var(--success))"
          bgClass="bg-success-light text-success"
        />
        <MetricRow
          icon={MessageSquare}
          label="Replied"
          value={stats.replied}
          total={stats.sent}
          color="hsl(var(--warning))"
          bgClass="bg-accent text-accent-foreground"
        />
      </Card>
    </div>
  );
}
