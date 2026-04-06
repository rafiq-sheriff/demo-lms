import { cn } from "@/lib/utils";

export type VideoPlayerProps = {
  embedId: string;
  startSeconds: number;
  title: string;
  className?: string;
  /** Pin the player while scrolling on large screens. */
  sticky?: boolean;
};

export function VideoPlayer({
  embedId,
  startSeconds,
  title,
  className,
  sticky = true,
}: VideoPlayerProps) {
  const src = `https://www.youtube.com/embed/${embedId}?start=${startSeconds}&rel=0`;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border/80 bg-black shadow-sm ring-1 ring-foreground/[0.04]",
        sticky && "lg:sticky lg:top-6 lg:z-10",
        className
      )}
    >
      <div className="relative aspect-video w-full">
        <iframe
          key={src}
          title={title}
          src={src}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
