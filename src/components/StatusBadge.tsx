import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

type Status = "pending" | "verified" | "rejected" | "none" | "upcoming" | "past" | "completed" | "cancelled";

const map: Record<Status, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  verified: { label: "Verified", className: "bg-secondary-soft text-secondary-foreground", Icon: CheckCircle2 },
  pending: { label: "Pending review", className: "bg-warning-soft text-warning-foreground", Icon: Clock },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive", Icon: XCircle },
  none: { label: "Not verified", className: "bg-muted text-muted-foreground", Icon: Clock },
  upcoming: { label: "Upcoming", className: "bg-primary-soft text-primary", Icon: Clock },
  past: { label: "Completed", className: "bg-secondary-soft text-secondary-foreground", Icon: CheckCircle2 },
  completed: { label: "Completed", className: "bg-secondary-soft text-secondary-foreground", Icon: CheckCircle2 },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground line-through", Icon: XCircle },
};

export function StatusBadge({ status, label, className }: { status: Status; label?: string; className?: string }) {
  const cfg = map[status];
  const Icon = cfg.Icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", cfg.className, className)}>
      <Icon className="h-3.5 w-3.5" />
      {label ?? cfg.label}
    </span>
  );
}
