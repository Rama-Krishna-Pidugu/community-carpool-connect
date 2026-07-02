import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex w-full items-center gap-2">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full text-xs font-semibold transition-colors",
                  done && "bg-secondary text-secondary-foreground",
                  active && "bg-primary text-primary-foreground ring-4 ring-primary-soft",
                  !done && !active && "bg-muted text-muted-foreground",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className={cn("hidden text-xs font-medium sm:block", active ? "text-foreground" : "text-muted-foreground")}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <span className={cn("h-0.5 flex-1 rounded-full transition-colors", i < current ? "bg-secondary" : "bg-muted")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
