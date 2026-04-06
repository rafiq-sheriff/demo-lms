"use client";

import { useEffect, useId } from "react";
import { X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { JobListing } from "@/lib/jobs-data";

type JobDetailModalProps = {
  job: JobListing | null;
  onClose: () => void;
  onApply?: (job: JobListing) => void;
  applyPending?: boolean;
};

export function JobDetailModal({ job, onClose, onApply, applyPending }: JobDetailModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!job) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [job]);

  useEffect(() => {
    if (!job) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [job, onClose]);

  if (!job) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl ring-1 ring-foreground/[0.06]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border/80 px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-xl font-semibold leading-tight text-foreground">
              {job.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {job.company} · {job.location} · {job.type}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "shrink-0 text-muted-foreground"
            )}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Description</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{job.fullDescription}</p>
          </section>
          {job.requirements.length > 0 ? (
            <section className="mt-6 space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Requirements</h3>
              <ul className="list-inside list-disc space-y-1.5 text-sm text-muted-foreground">
                {job.requirements.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <div className="border-t border-border/80 bg-muted/20 px-5 py-4">
          <Button
            type="button"
            className="w-full rounded-xl shadow-sm sm:w-auto"
            disabled={applyPending}
            onClick={() => {
              if (job && onApply) onApply(job);
              else onClose();
            }}
          >
            {applyPending ? "Submitting…" : onApply ? "Apply" : "Close"}
          </Button>
        </div>
      </div>
    </div>
  );
}
