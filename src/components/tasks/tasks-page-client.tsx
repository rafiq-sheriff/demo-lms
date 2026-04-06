"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { SubmissionModal } from "@/components/tasks/submission-modal";
import type { SubmissionPayload } from "@/components/tasks/submission-modal";
import { TaskCard } from "@/components/tasks/task-card";
import { ApiError, getMySubmissions, getTasks, submitTask, type SubmissionOut, type TaskOut } from "@/lib/api";
import type { TaskItem, TaskStatus } from "@/lib/tasks-data";

function formatDue(iso: string | null | undefined): string {
  if (!iso) return "No deadline";
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function submissionToStatus(sub: SubmissionOut | undefined): TaskStatus {
  if (!sub) return "pending";
  if (sub.status === "pending") return "submitted";
  return "reviewed";
}

function toTaskItem(task: TaskOut, sub?: SubmissionOut): TaskItem {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? "",
    deadline: formatDue(task.due_at),
    status: submissionToStatus(sub),
  };
}

export function TasksPageClient() {
  const qc = useQueryClient();
  const [modalTaskId, setModalTaskId] = useState<string | null>(null);

  const tasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: () => getTasks(),
  });

  const subsQuery = useQuery({
    queryKey: ["my-submissions"],
    queryFn: () => getMySubmissions(),
  });

  const byTaskId = useMemo(() => {
    const m = new Map<string, SubmissionOut>();
    for (const s of subsQuery.data ?? []) {
      m.set(s.task_id, s);
    }
    return m;
  }, [subsQuery.data]);

  const items: TaskItem[] = useMemo(() => {
    if (!tasksQuery.data) return [];
    return tasksQuery.data.map((t) => toTaskItem(t, byTaskId.get(t.id)));
  }, [tasksQuery.data, byTaskId]);

  const modalTask = modalTaskId ? items.find((t) => t.id === modalTaskId) : null;

  const submitMut = useMutation({
    mutationFn: async ({ taskId, linkUrl, fileUrl }: { taskId: string; linkUrl?: string; fileUrl?: string }) => {
      return submitTask(taskId, { link_url: linkUrl ?? null, file_url: fileUrl ?? null });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["my-submissions"] });
      toast.success("Submission received");
      setModalTaskId(null);
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.detail : "Submission failed");
    },
  });

  const handleSubmission = useCallback(
    async (taskId: string, payload: SubmissionPayload) => {
      if (payload.mode === "file") {
        toast.error("Please use a shareable link for now (file uploads need a storage URL).");
        return;
      }
      const link = payload.link.trim();
      if (!link) {
        toast.error("Enter a valid link");
        return;
      }
      await submitMut.mutateAsync({ taskId, linkUrl: link });
    },
    [submitMut],
  );

  if (tasksQuery.isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (tasksQuery.isError) {
    return (
      <div className="mx-auto max-w-4xl rounded-xl border border-dashed border-destructive/40 bg-destructive/5 px-6 py-10 text-center">
        <p className="font-medium text-foreground">Could not load tasks</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {tasksQuery.error instanceof ApiError ? tasksQuery.error.detail : "Try again later."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-1">
        <h1 className="lms-page-title">Tasks</h1>
        <p className="lms-page-lead mt-1">
          Submit assignments before the deadline. Track status from pending to reviewed.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-muted/30 px-6 py-14 text-center">
          <p className="font-medium text-foreground">No tasks yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tasks appear here when instructors publish them for your courses.
          </p>
        </div>
      ) : (
        <ul className="space-y-5">
          {items.map((task) => (
            <li key={task.id}>
              <TaskCard task={task} onSubmitClick={() => setModalTaskId(task.id)} />
            </li>
          ))}
        </ul>
      )}

      {modalTask ? (
        <SubmissionModal
          key={modalTask.id}
          taskTitle={modalTask.title}
          onClose={() => setModalTaskId(null)}
          onSubmit={(payload) => void handleSubmission(modalTask.id, payload)}
        />
      ) : null}
    </div>
  );
}
