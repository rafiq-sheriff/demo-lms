"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/admin/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ApiError,
  createJobAdmin,
  deleteJobAdmin,
  getJobs,
  updateJobAdmin,
  type JobOut,
} from "@/lib/api";

export function AdminJobsClient() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["jobs"], queryFn: getJobs });
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");

  const createMut = useMutation({
    mutationFn: () =>
      createJobAdmin({
        title: title.trim(),
        description: description.trim() || null,
        company: company.trim() || null,
        location: location.trim() || null,
        closes_at: null,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["jobs"] });
      await qc.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast.success("Job created");
      setShowForm(false);
      setTitle("");
      setDescription("");
      setCompany("");
      setLocation("");
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.detail : "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteJobAdmin(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job removed");
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.detail : "Failed"),
  });

  const patchMut = useMutation({
    mutationFn: ({ id, title: t }: { id: string; title: string }) => updateJobAdmin(id, { title: t }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job updated");
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.detail : "Failed"),
  });

  if (q.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Jobs" description="Manage job postings." />
        <TableSkeleton rows={6} />
      </div>
    );
  }

  if (q.isError) {
    return (
      <EmptyState
        title="Could not load jobs"
        description={q.error instanceof ApiError ? q.error.detail : "Error"}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        description="Manage job postings."
        actions={
          <Button type="button" className="rounded-xl" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Close" : "New job"}
          </Button>
        }
      />

      {showForm ? (
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Create job</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 w-full rounded-xl border border-border/80 px-3 text-sm"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] w-full rounded-xl border border-border/80 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="h-11 w-full rounded-xl border border-border/80 px-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-11 w-full rounded-xl border border-border/80 px-3 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <Button
                type="button"
                disabled={!title.trim() || createMut.isPending}
                className="rounded-xl"
                onClick={() => createMut.mutate()}
              >
                {createMut.isPending ? "Saving…" : "Publish"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border/80 bg-muted/30">
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Company</th>
              <th className="px-4 py-3 font-semibold">Location</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(q.data ?? []).map((j: JobOut) => (
              <tr key={j.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3">
                  <EditableTitle
                    title={j.title}
                    onSave={(t) => patchMut.mutate({ id: j.id, title: t })}
                    disabled={patchMut.isPending}
                  />
                </td>
                <td className="px-4 py-3">{j.company ?? "—"}</td>
                <td className="px-4 py-3">{j.location ?? "—"}</td>
                <td className="px-4 py-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="rounded-lg"
                    disabled={deleteMut.isPending}
                    onClick={() => {
                      if (confirm("Delete this job?")) deleteMut.mutate(j.id);
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditableTitle({
  title,
  onSave,
  disabled,
}: {
  title: string;
  onSave: (t: string) => void;
  disabled: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(title);

  if (editing) {
    return (
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (val.trim()) onSave(val.trim());
          setEditing(false);
        }}
      >
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="h-9 min-w-[12rem] rounded-lg border border-border/80 px-2 text-sm"
        />
        <Button type="submit" size="sm" disabled={disabled} className="rounded-lg">
          Save
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </form>
    );
  }

  return (
    <button
      type="button"
      className="text-left font-medium hover:underline"
      onClick={() => {
        setVal(title);
        setEditing(true);
      }}
    >
      {title}
    </button>
  );
}
