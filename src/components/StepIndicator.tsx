import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = {
  label: string;
  completed: boolean;
  active: boolean;
};

export function StepIndicator({ steps }: { steps: Step[] }) {
  return (
    <div className="flex items-center gap-1 w-full overflow-x-auto pb-2">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-1 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "step-checkmark transition-all duration-300",
                step.completed && "bg-success text-success-foreground",
                step.active && !step.completed && "bg-primary text-primary-foreground",
                !step.active && !step.completed && "bg-muted text-muted-foreground"
              )}
            >
              {step.completed ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-xs font-medium whitespace-nowrap",
                step.active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn(
              "w-6 h-0.5 mx-1",
              step.completed ? "bg-success" : "bg-muted"
            )} />
          )}
        </div>
      ))}
    </div>
  );
}
