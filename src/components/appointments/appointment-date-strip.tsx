"use client";

import { cn } from "@/lib/utils";

export type AppointmentDateStripProps = {
  dates: { key: string; label: string; dayNum: string; weekday: string }[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
};

export function AppointmentDateStrip({ dates, selectedKey, onSelect }: AppointmentDateStripProps) {
  return (
    <div className="relative">
      <p className="mb-3 text-sm font-medium text-foreground">Select a date</p>
      <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {dates.map((d) => {
          const selected = d.key === selectedKey;
          return (
            <button
              key={d.key}
              type="button"
              onClick={() => onSelect(d.key)}
              className={cn(
                "flex min-w-[4.25rem] shrink-0 flex-col items-center rounded-xl border px-3 py-2.5 text-center transition-all duration-200",
                selected
                  ? "border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                  : "border-border/80 bg-card text-foreground shadow-sm hover:border-primary/30 hover:shadow-md"
              )}
            >
              <span className="text-[11px] font-medium uppercase tracking-wide opacity-90">{d.weekday}</span>
              <span className="text-lg font-semibold tabular-nums leading-tight">{d.dayNum}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
