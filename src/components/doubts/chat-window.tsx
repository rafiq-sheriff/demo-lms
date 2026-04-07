"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

import { MessageBubble } from "@/components/doubts/message-bubble";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DoubtTicket, MessageSender } from "@/lib/doubts-data";

function labelsFor(viewerRole: "student" | "admin"): Record<MessageSender, string> {
  if (viewerRole === "student") {
    return { student: "You", admin: "Support" };
  }
  return { student: "Student", admin: "You" };
}

export type ChatWindowProps = {
  ticket: DoubtTicket | null;
  onSendMessage: (body: string) => void;
  onCloseTicket?: () => void;
  closePending?: boolean;
  className?: string;
  viewerRole: "student" | "admin";
};

export function ChatWindow({
  ticket,
  onSendMessage,
  onCloseTicket,
  closePending,
  className,
  viewerRole,
}: ChatWindowProps) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = ticket?.messages ?? [];
  const senderLabel = labelsFor(viewerRole);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, ticket?.id]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !ticket) return;
    onSendMessage(text);
    setDraft("");
  }

  return (
    <div
      className={cn(
        "flex min-h-[22rem] flex-1 flex-col rounded-xl border border-border/80 bg-card shadow-sm ring-1 ring-foreground/[0.04] md:min-h-[28rem]",
        className
      )}
    >
      {ticket ? (
        <>
          <header className="flex shrink-0 flex-col gap-2 border-b border-border/80 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:px-5">
            <div className="min-w-0">
              <h2 className="text-base font-semibold leading-snug text-foreground">{ticket.title}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {ticket.status === "open" ? "Open thread" : "Closed thread (read-only)"}
              </p>
            </div>
            {ticket.status === "open" && onCloseTicket ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 rounded-xl"
                disabled={closePending}
                onClick={onCloseTicket}
              >
                {closePending ? "Closing…" : "Close thread"}
              </Button>
            ) : null}
          </header>

          <div
            ref={scrollRef}
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-3 py-4 sm:px-5"
          >
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} senderLabel={senderLabel} viewerRole={viewerRole} />
            ))}
            <div ref={bottomRef} aria-hidden className="h-px shrink-0" />
          </div>

          <form
            onSubmit={handleSubmit}
            className="sticky bottom-0 z-10 shrink-0 border-t border-border/80 bg-card/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:p-4"
          >
            <div className="flex gap-2">
              <label htmlFor="doubt-chat-input" className="sr-only">
                Message
              </label>
              <textarea
                id="doubt-chat-input"
                rows={1}
                placeholder={
                  ticket.status === "closed"
                    ? "This thread is closed"
                    : "Type a message…"
                }
                disabled={ticket.status === "closed"}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                className="max-h-32 min-h-11 flex-1 resize-y rounded-xl border border-border/80 bg-muted/40 px-3 py-2.5 text-sm outline-none ring-0 transition placeholder:text-muted-foreground focus:border-primary/40 focus:bg-background focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <Button
                type="submit"
                disabled={ticket.status === "closed" || !draft.trim()}
                className={cn(
                  buttonVariants({ size: "icon", variant: "default" }),
                  "h-11 w-11 shrink-0 rounded-xl"
                )}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
          <p className="text-sm font-medium text-foreground">Select a doubt</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Choose a ticket from the list or start a new doubt to begin messaging.
          </p>
        </div>
      )}
    </div>
  );
}
