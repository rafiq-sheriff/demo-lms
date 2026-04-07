"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/admin/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ApiError,
  createTaskAdmin,
  getCourses,
  listAllSubmissions,
  reviewSubmissionAdmin,
  type CourseOut,
  type SubmissionStatus,
  type SubmissionWithUser,
} from "@/lib/api";

export function AdminTasksClient() {
  const qc = useQueryClient();
  const courses = useQuery({ queryKey: ["courses"], queryFn: getCourses });
  const submissions = useQuery({ queryKey: ["admin", "submissions"], queryFn: listAllSubmissions });

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState<string>("");

  const createMut = useMutation({
    mutationFn: async () => {
      if (!courseId) throw new Error("Select a course");
      return createTaskAdmin({
        title: title.trim(),
        description: description.trim() || null,
        course_id: courseId,
        lesson_id: null,
        due_at: null,
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tasks"] });
      await qc.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast.success("Task created");
      setShowForm(false);
      setTitle("");
      setDescription("");
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.detail : e instanceof Error ? e.message : "Failed"),
  });

  const reviewMut = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: SubmissionStatus;
    }) => reviewSubmissionAdmin(id, { status, feedback: null, score: null }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "submissions"] });
      toast.success("Submission updated");
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.detail : "Failed"),
  });

  if (submissions.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Tasks" description="Create assignments and review submissions." />
        <TableSkeleton rows={8} />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title="Tasks"
        description="Create assignments and review submissions."
        actions={
          <Button type="button" className="rounded-xl" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Close" : "New task"}
          </Button>
        }
      />

      {showForm ? (
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Create task</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Course</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="h-11 w-full max-w-md rounded-xl border border-border/80 bg-background px-3 text-sm"
              >
                <option value="">Select course</option>
                {(courses.data ?? []).map((c: CourseOut) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 w-full max-w-xl rounded-xl border border-border/80 px-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] w-full max-w-2xl rounded-xl border border-border/80 px-3 py-2 text-sm"
              />
            </div>
            <Button
              type="button"
              disabled={!title.trim() || !courseId || createMut.isPending}
              className="rounded-xl"
              onClick={() => createMut.mutate()}
            >
              {createMut.isPending ? "Saving…" : "Create task"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">All submissions</h2>
        <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-sm">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-muted/30">
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold">Task</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Link</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(submissions.data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No submissions yet.
                  </td>
                </tr>
              ) : (
                (submissions.data ?? []).map((s: SubmissionWithUser) => (
                  <tr key={s.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium">{s.user_full_name}</div>
                      <div className="text-xs text-muted-foreground">{s.user_email}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{s.task_id.slice(0, 8)}…</td>
                    <td className="px-4 py-3 capitalize">{s.status}</td>
                    <td className="px-4 py-3">
                      {s.link_url ? (
                        <a href={s.link_url} className="text-primary underline" target="_blank" rel="noreferrer">
                          Open
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {s.status === "pending" ? (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className="rounded-lg"
                            disabled={reviewMut.isPending}
                            onClick={() => reviewMut.mutate({ id: s.id, status: "reviewed" })}
                          >
                            Mark reviewed
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-lg"
                            disabled={reviewMut.isPending}
                            onClick={() => reviewMut.mutate({ id: s.id, status: "rejected" })}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
