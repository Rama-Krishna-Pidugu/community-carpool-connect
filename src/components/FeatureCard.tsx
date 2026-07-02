import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function FeatureCard({
  icon: Icon,
  title,
  description,
  tone = "primary",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: "primary" | "secondary" | "accent" | "warning";
}) {
  const tones = {
    primary: "bg-primary-soft text-primary",
    secondary: "bg-secondary-soft text-secondary",
    accent: "bg-accent-soft text-accent",
    warning: "bg-warning-soft text-warning-foreground",
  };
  return (
    <Card className="group h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-hover)]">
      <CardContent className="space-y-3 p-6">
        <span className={cn("inline-grid h-12 w-12 place-items-center rounded-xl", tones[tone])}>
          <Icon className="h-6 w-6" />
        </span>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
