import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type CourseCardProps = {
  title: string;
  price: string;
  rating: number;
  /** Lesson count; use 0 when unknown (shows “Open curriculum”). */
  lessons: number;
  courseId: string;
  /** When set, the primary button links here instead of `/course/[courseId]` (e.g. `/courses`). */
  programHref?: string;
  /** Free tier — shows a “Free” badge on the card. */
  isFree?: boolean;
  /** Catalog variant: image header, overlay, stronger hover. */
  variant?: "default" | "catalog";
};

function gradientForId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * (i + 1)) % 360;
  const h2 = (h + 40) % 360;
  return `linear-gradient(135deg, oklch(0.55 0.14 ${h}) 0%, oklch(0.5 0.12 ${h2}) 55%, oklch(0.45 0.1 ${h}) 100%)`;
}

/**
 * Reusable program card for AI / data courses.
 */
export function CourseCard({
  title,
  price,
  rating,
  lessons,
  courseId,
  programHref,
  isFree = false,
  variant = "default",
}: CourseCardProps) {
  const href = programHref ?? `/course/${courseId}`;
  const isCatalog = variant === "catalog";

  return (
    <Card
      className={cn(
        "group h-full overflow-hidden rounded-xl border-border/80 bg-card shadow-sm ring-1 ring-foreground/[0.04] transition duration-200",
        isCatalog && "hover:scale-[1.02] hover:shadow-md",
        !isCatalog && "hover:-translate-y-1 hover:shadow-md"
      )}
    >
      <div
        className={cn(
          "relative border-b border-border/60",
          isCatalog ? "aspect-[16/10]" : "aspect-[2/1]"
        )}
      >
        <div
          className="absolute inset-0 transition duration-300 group-hover:brightness-[1.03]"
          style={{ background: gradientForId(courseId) }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.5),transparent_55%)]" />
        <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
          <span
            className={cn(
              "rounded-lg px-2.5 py-1 text-[13px] font-bold tabular-nums shadow-sm ring-1 ring-black/5 backdrop-blur-sm",
              isFree
                ? "bg-emerald-600/95 text-white ring-emerald-900/20"
                : "bg-white/95 text-zinc-900",
            )}
          >
            {isFree ? "Free" : price}
          </span>
        </div>
      </div>

      <CardHeader className="space-y-0 pb-2 pt-5">
        <CardTitle className="text-[15px] font-semibold leading-snug tracking-tight text-foreground sm:text-base">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted-foreground sm:text-sm">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Rating</dt>
            <dd className="flex items-center gap-1 font-medium text-foreground">
              <span className="text-amber-500" aria-hidden>
                ★
              </span>
              <span className="tabular-nums">{rating.toFixed(1)}</span>
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Lessons</dt>
            <dd>
              {lessons > 0 ? (
                <>
                  <span className="font-semibold tabular-nums text-foreground">{lessons}</span> lessons
                </>
              ) : (
                <span className="text-muted-foreground">Open curriculum</span>
              )}
            </dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter className="border-t border-border/80 bg-muted/30 pt-4">
        <Link
          href={href}
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "h-11 w-full rounded-xl px-4 text-sm font-semibold shadow-sm transition hover:shadow-md active:translate-y-px",
            isCatalog && "min-h-12 text-[15px]"
          )}
        >
          View program
        </Link>
      </CardFooter>
    </Card>
  );
}
