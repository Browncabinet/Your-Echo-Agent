import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { Footer } from "@/components/Footer";

export default function CheckoutTest() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PaymentTestModeBanner />
      <main className="flex-1 container max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Sandbox Checkout Test</h1>
        <p className="text-muted-foreground mb-6">
          Charges $1.00 in Stripe test mode. No real money moves.
        </p>

        <Card className="p-6 space-y-4">
          <div>
            <h2 className="font-semibold mb-2">Test card</h2>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Card number: <code className="font-mono">4242 4242 4242 4242</code></li>
              <li>Expiry: any future date (e.g. <code className="font-mono">12/34</code>)</li>
              <li>CVC: any 3 digits</li>
              <li>ZIP: any 5 digits</li>
            </ul>
          </div>
          <Button onClick={() => setOpen(true)} size="lg" className="w-full">
            Start $1 test checkout
          </Button>
        </Card>
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sandbox checkout</DialogTitle>
          </DialogHeader>
          {open && (
            <StripeEmbeddedCheckout
              priceId="test_payment_1"
              customerEmail={user?.email}
              userId={user?.id}
              returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
            />
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
