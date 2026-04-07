import { MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { DoubtTicket, TicketStatus } from "@/lib/doubts-data";
import { lastMessagePreview } from "@/lib/doubts-data";

function StatusPill({ status }: { status: TicketStatus }) {
  const isOpen = status === "open";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        isOpen
          ? "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/25 dark:text-emerald-400"
          : "bg-muted text-muted-foreground ring-1 ring-border/80"
      )}
    >
      {isOpen ? "Open" : "Closed"}
    </span>
  );
}

export type TicketListProps = {
  tickets: DoubtTicket[];
  activeId: string | null;
  onSelect: (id: string) => void;
  variant?: "student" | "admin";
};

export function TicketList({ tickets, activeId, onSelect, variant = "student" }: TicketListProps) {
  const heading = variant === "admin" ? "Support inbox" : "Your doubts";
  const sub =
    variant === "admin"
      ? `${tickets.length} student threads`
      : `${tickets.length} conversations`;

  return (
    <div className="flex min-h-0 flex-col rounded-xl border border-border/80 bg-card shadow-sm ring-1 ring-foreground/[0.04]">
      <div className="shrink-0 border-b border-border/80 px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">{heading}</h2>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      <ul
        className="max-h-[40vh] min-h-0 flex-1 overflow-y-auto overscroll-contain md:max-h-none"
        role="listbox"
        aria-label="Doubt tickets"
      >
        {tickets.map((t) => {
          const active = t.id === activeId;
          const preview = lastMessagePreview(t.messages) || t.title;
          return (
            <li key={t.id}>
              <button
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => onSelect(t.id)}
                className={cn(
                  "flex w-full flex-col gap-1 border-b border-border/60 px-4 py-3 text-left transition-colors last:border-b-0",
                  active
                    ? "bg-primary/10 ring-1 ring-inset ring-primary/20"
                    : "hover:bg-muted/50"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
                    {t.title}
                  </span>
                  <StatusPill status={t.status} />
                </div>
                {variant === "admin" && t.studentLabel ? (
                  <p className="text-[11px] font-medium text-primary/90">{t.studentLabel}</p>
                ) : null}
                <p className="line-clamp-2 text-xs text-muted-foreground">{preview}</p>
              </button>
            </li>
          );
        })}
      </ul>
      {tickets.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-12 text-center">
          <MessageCircle className="h-8 w-8 text-muted-foreground/60" aria-hidden />
          <p className="text-sm text-muted-foreground">
            {variant === "admin" ? "No open threads" : "No doubts yet"}
          </p>
        </div>
      ) : null}
    </div>
  );
}
