"use client";

import { useEffect, useId, useState } from "react";
import { X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NewTicketPayload = {
  title: string;
  description: string;
};

type NewTicketModalProps = {
  onClose: () => void;
  onSubmit: (payload: NewTicketPayload) => void;
};

export function NewTicketModal({ onClose, onSubmit }: NewTicketModalProps) {
  const titleId = useId();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const t = title.trim();
    const d = description.trim();
    if (!t) {
      setError("Add a title for your doubt.");
      return;
    }
    if (!d) {
      setError("Describe your doubt so support can help.");
      return;
    }
    onSubmit({ title: t, description: d });
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
        className="relative z-10 flex max-h-[min(90vh,560px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl ring-1 ring-foreground/[0.06]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border/80 px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold leading-tight text-foreground">
              New doubt
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Start a thread with support. You can add more detail in chat after submitting.
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

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="space-y-4 px-5 py-5">
            <div className="space-y-1.5">
              <label htmlFor="new-ticket-title" className="text-sm font-medium text-foreground">
                Title
              </label>
              <input
                id="new-ticket-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Short summary of your question"
                className="h-11 w-full rounded-xl border border-border/80 bg-background px-3 text-sm outline-none ring-0 transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="new-ticket-desc" className="text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                id="new-ticket-desc"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What are you stuck on? Include course or lesson if relevant."
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
            <Button type="submit" className="rounded-xl">
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
