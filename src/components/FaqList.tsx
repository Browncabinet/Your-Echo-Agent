import { ChevronDown } from "lucide-react";

export function FaqList({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="w-full">
      {items.map(({ question, answer }) => (
        <details key={question} className="group border-b border-border">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-sm font-medium text-foreground hover:underline [&::-webkit-details-marker]:hidden">
            {question}
            <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
          </summary>
          <p className="pb-4 text-sm leading-relaxed text-muted-foreground">{answer}</p>
        </details>
      ))}
    </div>
  );
}