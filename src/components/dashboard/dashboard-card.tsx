import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type DashboardCardProps = React.ComponentProps<typeof Card> & {
  title?: string;
  description?: string;
  /** Render actions in the header row */
  action?: React.ReactNode;
};

export function DashboardCard({
  className,
  title,
  description,
  action,
  children,
  ...props
}: DashboardCardProps) {
  return (
    <Card
      className={cn(
        "rounded-xl border-border/80 bg-card shadow-sm ring-1 ring-foreground/[0.04]",
        className
      )}
      {...props}
    >
      {title || description || action ? (
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 border-b border-border/60 pb-4">
          <div className="min-w-0 space-y-1">
            {title ? (
              <CardTitle className="text-base font-semibold leading-tight">{title}</CardTitle>
            ) : null}
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </CardHeader>
      ) : null}
      <CardContent>{children}</CardContent>
    </Card>
  );
}
