import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  className?: string;
};

export function StatCard({ title, value, hint, icon: Icon, className }: StatCardProps) {
  const colorMap: Record<string, { iconBg: string; iconText: string }> = {
    "Total users": { iconBg: "bg-indigo-50", iconText: "text-indigo-600" },
    "Total courses": { iconBg: "bg-purple-50", iconText: "text-purple-600" },
    "Active enrollments": { iconBg: "bg-emerald-50", iconText: "text-emerald-600" },
    "Tasks submitted": { iconBg: "bg-amber-50", iconText: "text-amber-600" },
    "Open doubts": { iconBg: "bg-blue-50", iconText: "text-blue-600" },
    "Booked appointments": { iconBg: "bg-rose-50", iconText: "text-rose-600" },
  };
  const tone = colorMap[title] ?? { iconBg: "bg-slate-100", iconText: "text-slate-600" };

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm text-slate-600">{title}</p>
          <p className="text-3xl font-bold tabular-nums tracking-tight text-slate-900">{value}</p>
          {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
        </div>
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", tone.iconBg)}>
          <Icon className={cn("h-5 w-5", tone.iconText)} aria-hidden />
        </div>
      </div>
    </div>
  );
}
