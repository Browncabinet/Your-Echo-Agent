import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useCredits } from "@/hooks/use-credits";
import { useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function CheckoutReturn() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();
  const { refresh } = useCredits();
  const { user } = useAuth();
  const [a2aBalanceCents, setA2aBalanceCents] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncFailed, setSyncFailed] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    // Nudge normal user credits (top-up packs on user_credits).
    const timer = setTimeout(() => refresh(), 2000);
    return () => clearTimeout(timer);
  }, [sessionId, refresh]);

  // Poll a2a_partners.balance_cents for up to ~24s in case the checkout
  // was an A2A partner top-up. Webhook can lag; this keeps the UI honest.
  useEffect(() => {
    if (!sessionId || !user) return;
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 12;

    (async () => {
      const { data: partner } = await supabase
        .from("a2a_partners")
        .select("id, balance_cents")
        .eq("owner_user_id", user.id)
        .maybeSingle();

      if (!partner) return; // not an A2A partner
      setA2aBalanceCents(partner.balance_cents ?? 0);
      const startingBalance = partner.balance_cents ?? 0;
      setSyncing(true);

      while (!cancelled && attempts < maxAttempts) {
        attempts++;
        await new Promise((r) => setTimeout(r, 2000));
        const { data: p } = await supabase
          .from("a2a_partners")
          .select("balance_cents")
          .eq("id", partner.id)
          .maybeSingle();
        if (cancelled) return;
        const current = p?.balance_cents ?? 0;
        setA2aBalanceCents(current);
        if (current > startingBalance) {
          setSyncing(false);
          return;
        }
      }
      if (!cancelled) {
        setSyncing(false);
        setSyncFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, user]);

  const isA2A = a2aBalanceCents !== null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          {sessionId ? (
            <>
              <CheckCircle className="w-12 h-12 text-primary mx-auto" />
              <h1 className="text-xl font-bold text-foreground">
                {isA2A ? "Top-up received!" : "Emails Added!"}
              </h1>

              {isA2A ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Current partner balance:{" "}
                    <span className="font-semibold text-foreground">
                      ${((a2aBalanceCents ?? 0) / 100).toFixed(2)}
                    </span>
                  </p>
                  {syncing && (
                    <p className="text-xs text-muted-foreground inline-flex items-center gap-2 justify-center">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Finalizing your top-up…
                    </p>
                  )}
                  {syncFailed && (
                    <p className="text-xs text-destructive">
                      Payment received but balance hasn't updated yet. It will
                      appear shortly — refresh in a minute, or contact support
                      if it doesn't.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Your emails have been added to your account. They're ready to
                  use immediately.
                </p>
              )}
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-foreground">
                No payment information found
              </h1>
              <p className="text-sm text-muted-foreground">
                If you completed a purchase, your emails will appear shortly.
              </p>
            </>
          )}
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => navigate("/")} variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Button>
            {isA2A && (
              <Button onClick={() => navigate("/for-agents/billing")}>
                View Billing
              </Button>
            )}
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
