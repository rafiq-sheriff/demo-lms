import { Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/tasks/status-badge";
import type { TaskItem } from "@/lib/tasks-data";

export type TaskCardProps = {
  task: TaskItem;
  onSubmitClick: () => void;
};

export function TaskCard({ task, onSubmitClick }: TaskCardProps) {
  const isPending = task.status === "pending";

  return (
    <Card className="rounded-xl border-border/80 bg-card shadow-sm ring-1 ring-foreground/[0.04] transition-shadow hover:shadow-md">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <CardTitle className="text-lg font-semibold leading-snug text-foreground">
            {task.title}
          </CardTitle>
          <StatusBadge status={task.status} className="shrink-0 self-start" />
        </div>
        <CardDescription className="text-sm leading-relaxed text-muted-foreground">
          {task.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span>{task.deadline}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 border-t border-border/60 bg-muted/20">
        <Button
          type="button"
          className="rounded-xl"
          disabled={!isPending}
          onClick={onSubmitClick}
        >
          {isPending ? "Submit" : task.status === "submitted" ? "Submitted" : "Reviewed"}
        </Button>
        {!isPending ? (
          <span className="self-center text-xs text-muted-foreground">
            {task.status === "submitted"
              ? "Awaiting review"
              : "Feedback has been posted"}
          </span>
        ) : null}
      </CardFooter>
    </Card>
  );
}
