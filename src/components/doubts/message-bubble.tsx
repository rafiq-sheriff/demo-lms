import { cn } from "@/lib/utils";
import type { DoubtMessage, MessageSender } from "@/lib/doubts-data";

function formatMessageTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export type MessageBubbleProps = {
  message: DoubtMessage;
  /** Label shown for mentor (e.g. "Mentor") and student (e.g. "You") */
  senderLabel: Record<MessageSender, string>;
};

export function MessageBubble({ message, senderLabel }: MessageBubbleProps) {
  const isStudent = message.sender === "student";

  return (
    <div
      className={cn(
        "flex w-full max-w-[min(100%,36rem)] flex-col gap-1",
        isStudent ? "ml-auto items-end" : "mr-auto items-start"
      )}
    >
      <div
        className={cn(
          "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
          isStudent
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border border-border/60 bg-muted text-foreground"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
      </div>
      <div
        className={cn(
          "flex items-center gap-2 px-1 text-[11px] text-muted-foreground",
          isStudent ? "justify-end" : "justify-start"
        )}
      >
        <span className="font-medium">{senderLabel[message.sender]}</span>
        <span aria-hidden>·</span>
        <time dateTime={message.at}>{formatMessageTime(message.at)}</time>
      </div>
    </div>
  );
}
