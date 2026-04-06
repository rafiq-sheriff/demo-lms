import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/lib/tasks-data";

const styles: Record<
  TaskStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className:
      "border-border/80 bg-muted text-muted-foreground ring-1 ring-foreground/[0.06]",
  },
  submitted: {
    label: "Submitted",
    className:
      "border-primary/25 bg-primary/10 text-primary ring-1 ring-primary/15",
  },
  reviewed: {
    label: "Reviewed",
    className:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20",
  },
};

export type StatusBadgeProps = {
  status: TaskStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const s = styles[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        s.className,
        className
      )}
    >
      {s.label}
    </span>
  );
}
