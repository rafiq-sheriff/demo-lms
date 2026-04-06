import { cn } from "@/lib/utils";

export type ProgressBarProps = {
  /** 0–100 */
  value: number;
  className?: string;
  /** e.g. "3 of 12 lessons completed" */
  caption?: string;
};

export function ProgressBar({ value, className, caption }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-foreground">Your progress</span>
        <span className="tabular-nums text-sm font-semibold text-primary">{Math.round(clamped)}%</span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {caption ? <p className="text-xs text-muted-foreground">{caption}</p> : null}
    </div>
  );
}
