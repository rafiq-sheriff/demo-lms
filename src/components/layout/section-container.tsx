import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type SectionContainerProps = ComponentProps<"div"> & {
  /** Narrower readable width for headings */
  narrow?: boolean;
};

export function SectionContainer({
  className,
  narrow,
  children,
  ...props
}: SectionContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8",
        narrow && "max-w-3xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
