import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Infinity as InfinityIcon } from "lucide-react";

export type TopupPack = {
  priceId: "topup_500" | "topup_1000" | "topup_2500" | "topup_10000";
  emails: number;
  price: number;
  perEmail: string;
  badge?: string;
};

export const TOPUP_PACKS: TopupPack[] = [
  { priceId: "topup_500", emails: 500, price: 12, perEmail: "$0.024" },
  { priceId: "topup_1000", emails: 1000, price: 22, perEmail: "$0.022", badge: "Popular" },
  { priceId: "topup_2500", emails: 2500, price: 45, perEmail: "$0.018", badge: "Best Value" },
  { priceId: "topup_10000", emails: 10000, price: 149, perEmail: "$0.015", badge: "Agency" },
];

interface TopupPacksProps {
  title?: string;
  subtitle?: string;
  onSelect: (priceId: TopupPack["priceId"]) => void;
}

export function TopupPacks({
  title = "Need more emails this week?",
  subtitle = "One-time top-up packs. Never expire. Roll over week-to-week.",
  onSelect,
}: TopupPacksProps) {
  return (
    <div className="space-y-4">
      {(title || subtitle) && (
        <div className="text-center">
          {title && <h3 className="text-lg sm:text-xl font-bold text-foreground">{title}</h3>}
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
              <InfinityIcon className="w-3.5 h-3.5" /> {subtitle}
            </p>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TOPUP_PACKS.map((pack) => (
          <Card
            key={pack.priceId}
            onClick={() => onSelect(pack.priceId)}
            className={`relative p-5 cursor-pointer hover:border-primary hover:shadow-md transition-all ${
              pack.badge === "Popular" ? "border-primary ring-1 ring-primary/20" : ""
            }`}
          >
            {pack.badge && (
              <Badge className="absolute -top-2 right-3 text-[10px]">{pack.badge}</Badge>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">
                  +{pack.emails.toLocaleString()} emails
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pack.perEmail}/email · one-time
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">${pack.price}</p>
                <Plus className="w-4 h-4 text-primary ml-auto mt-1" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
