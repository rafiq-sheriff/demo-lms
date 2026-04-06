"use client";

import { cn } from "@/lib/utils";
import {
  jobLocationFilters,
  jobRoleFilters,
  jobTypeFilters,
} from "@/lib/jobs-data";

export type JobFilterState = {
  role: string;
  location: string;
  type: string;
};

type JobFiltersProps = {
  value: JobFilterState;
  onChange: (next: JobFilterState) => void;
};

function FilterChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20"
          : "border-border/80 bg-card text-muted-foreground hover:border-primary/30 hover:bg-muted/50 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

export function JobFilters({ value, onChange }: JobFiltersProps) {
  return (
    <div className="space-y-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm ring-1 ring-foreground/[0.03]">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role</p>
        <div className="flex flex-wrap gap-2">
          {jobRoleFilters.map((r) => (
            <FilterChip
              key={r}
              label={r}
              selected={value.role === r}
              onClick={() => onChange({ ...value, role: r })}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Location
        </p>
        <div className="flex flex-wrap gap-2">
          {jobLocationFilters.map((l) => (
            <FilterChip
              key={l}
              label={l}
              selected={value.location === l}
              onClick={() => onChange({ ...value, location: l })}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</p>
        <div className="flex flex-wrap gap-2">
          {jobTypeFilters.map((t) => (
            <FilterChip
              key={t}
              label={t}
              selected={value.type === t}
              onClick={() => onChange({ ...value, type: t })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
