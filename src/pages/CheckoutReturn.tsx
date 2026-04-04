import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { useCredits } from "@/hooks/use-credits";
import { useEffect } from "react";

export default function CheckoutReturn() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();
  const { refresh } = useCredits();

  useEffect(() => {
    if (sessionId) {
      // Refresh credits after successful purchase
      const timer = setTimeout(() => refresh(), 2000);
      return () => clearTimeout(timer);
    }
  }, [sessionId, refresh]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center space-y-4">
        {sessionId ? (
          <>
            <CheckCircle className="w-12 h-12 text-primary mx-auto" />
            <h1 className="text-xl font-bold text-foreground">Emails Added!</h1>
            <p className="text-sm text-muted-foreground">
              Your emails have been added to your account. They're ready to use immediately.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-foreground">No payment information found</h1>
            <p className="text-sm text-muted-foreground">
              If you completed a purchase, your credits will appear shortly.
            </p>
          </>
        )}
        <Button onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
      </Card>
    </div>
  );
}
