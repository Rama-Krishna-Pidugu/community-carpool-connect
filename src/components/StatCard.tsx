import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon, label, value, tone = "primary",
}: { icon: LucideIcon; label: string; value: string; tone?: "primary" | "secondary" | "accent" | "warning" }) {
  const tones = {
    primary: "bg-primary-soft text-primary",
    secondary: "bg-secondary-soft text-secondary",
    accent: "bg-accent-soft text-accent",
    warning: "bg-warning-soft text-warning-foreground",
  };
  return (
    <Card className="transition-shadow hover:shadow-[var(--shadow-hover)]">
      <CardContent className="flex items-center gap-4 p-5">
        <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", tones[tone])}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
