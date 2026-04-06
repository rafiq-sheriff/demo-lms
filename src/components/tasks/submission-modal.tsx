"use client";

import { useEffect, useId, useState } from "react";
import { X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SubmissionPayload = {
  mode: "file" | "link";
  fileName: string | null;
  link: string;
  notes: string;
};

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

type SubmissionModalProps = {
  taskTitle: string;
  onClose: () => void;
  onSubmit: (payload: SubmissionPayload) => void | Promise<void>;
};

export function SubmissionModal({ taskTitle, onClose, onSubmit }: SubmissionModalProps) {
  const titleId = useId();
  const [mode, setMode] = useState<"file" | "link">("link");
  const [fileName, setFileName] = useState<string | null>(null);
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setFileName(f ? f.name : null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "file") {
      if (!fileName) {
        setError("Select a file to upload.");
        return;
      }
      setPending(true);
      try {
        await Promise.resolve(onSubmit({ mode: "file", fileName, link: "", notes: notes.trim() }));
      } finally {
        setPending(false);
      }
      return;
    }

    const trimmed = link.trim();
    if (!trimmed) {
      setError("Enter a valid link.");
      return;
    }
    if (!isValidHttpUrl(trimmed)) {
      setError("Enter a valid URL (include https://).");
      return;
    }

    setPending(true);
    try {
      await Promise.resolve(
        onSubmit({ mode: "link", fileName: null, link: trimmed, notes: notes.trim() }),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="presentation"
    >
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
        className="relative z-10 flex max-h-[min(90vh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl ring-1 ring-foreground/[0.06]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border/80 px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold leading-tight text-foreground">
              Submit work
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{taskTitle}</p>
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

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="space-y-5 px-5 py-5">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-foreground">Submission type</legend>
              <div className="flex flex-wrap gap-2">
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition",
                    mode === "link"
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border/80 bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <input
                    type="radio"
                    name="submission-mode"
                    className="sr-only"
                    checked={mode === "link"}
                    onChange={() => setMode("link")}
                  />
                  Link
                </label>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition",
                    mode === "file"
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border/80 bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <input
                    type="radio"
                    name="submission-mode"
                    className="sr-only"
                    checked={mode === "file"}
                    onChange={() => setMode("file")}
                  />
                  File upload
                </label>
              </div>
            </fieldset>

            {mode === "link" ? (
              <div className="space-y-1.5">
                <label htmlFor="submission-link" className="text-sm font-medium text-foreground">
                  Link
                </label>
                <input
                  id="submission-link"
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="https://…"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border/80 bg-background px-3 text-sm outline-none ring-0 transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <span className="text-sm font-medium text-foreground">File</span>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/30 px-4 py-8 transition hover:bg-muted/50">
                  <input
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {fileName ? fileName : "Click to choose a file"}
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">PDF, ZIP, or notebook export</span>
                </label>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="submission-notes" className="text-sm font-medium text-foreground">
                Notes
              </label>
              <textarea
                id="submission-notes"
                rows={4}
                placeholder="Context for your mentor or reviewer…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full resize-y rounded-xl border border-border/80 bg-background px-3 py-2.5 text-sm outline-none ring-0 transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {error ? (
              <p className="text-sm font-medium text-destructive" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <div className="mt-auto flex flex-col-reverse gap-2 border-t border-border/80 bg-muted/20 px-5 py-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl" disabled={pending}>
              {pending ? "Submitting…" : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
