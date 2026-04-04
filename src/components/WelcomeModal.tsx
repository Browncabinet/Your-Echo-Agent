import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Coins } from "lucide-react";

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTryFastMode: () => void;
}

export function WelcomeModal({ open, onOpenChange, onTryFastMode }: WelcomeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader className="items-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-xl">Welcome to Your Echo Agent! 🎉</DialogTitle>
          <DialogDescription className="text-sm pt-1">
            You're all set to start your first outreach campaign.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-left">
          <div className="flex items-start gap-3 rounded-lg border border-border p-3">
            <Zap className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Start with Fast Mode</p>
              <p className="text-xs text-muted-foreground">
                Just paste your website URL and let the AI detect your niche, write emails, and find leads — automatically.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border p-3">
            <Coins className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">50 free emails included</p>
              <p className="text-xs text-muted-foreground">
                Enough to test a small campaign and see real results. No credit card needed.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <Button onClick={onTryFastMode} className="w-full gap-2">
            <Zap className="h-4 w-4" />
            Try Fast Mode
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            I'll explore on my own
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
