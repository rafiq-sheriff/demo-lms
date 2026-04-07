"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { JobCard } from "@/components/jobs/job-card";
import { JobDetailModal } from "@/components/jobs/job-detail-modal";
import { JobFilters, type JobFilterState } from "@/components/jobs/job-filters";
import {
  ApiError,
  applyJob,
  getJobs,
  getMyApplications,
  type JobOut,
} from "@/lib/api";
import type { JobListing, JobType } from "@/lib/jobs-data";

const defaultFilters: JobFilterState = {
  role: "All roles",
  location: "All locations",
  type: "All types",
};

function inferRole(title: string): JobListing["role"] {
  const t = title.toLowerCase();
  if (t.includes("ml ") || t.includes("machine learning") || t.includes("ranking")) {
    return "Machine Learning";
  }
  if (t.includes("engineer") && (t.includes("data") || t.includes("analytics"))) {
    return "Data Engineering";
  }
  if (t.includes("bi ") || t.includes("business intelligence") || t.includes("power bi")) {
    return "Business Intelligence";
  }
  return "Data Analyst";
}

function inferType(title: string): JobType {
  const t = title.toLowerCase();
  return t.includes("intern") ? "Internship" : "Full-time";
}

function apiJobToListing(j: JobOut): JobListing {
  const desc = j.description ?? "";
  return {
    id: j.id,
    title: j.title,
    company: j.company ?? "Hiring company",
    location: j.location ?? "Remote",
    type: inferType(j.title),
    role: inferRole(j.title),
    shortDescription: desc.length > 180 ? `${desc.slice(0, 177)}…` : desc || "Role details from the LMS job board.",
    fullDescription: desc || "No description provided.",
    requirements: [],
  };
}

export function JobsPageClient() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<JobFilterState>(defaultFilters);
  const [detailJob, setDetailJob] = useState<JobListing | null>(null);

  const jobsQuery = useQuery({
    queryKey: ["jobs"],
    queryFn: getJobs,
  });

  const appsQuery = useQuery({
    queryKey: ["my-applications"],
    queryFn: getMyApplications,
  });

  const appliedByJobId = useMemo(() => {
    const m = new Map<string, string | null>();
    for (const a of appsQuery.data ?? []) {
      m.set(a.job_id, a.applied_at);
    }
    return m;
  }, [appsQuery.data]);

  const listings = useMemo(
    () =>
      (jobsQuery.data ?? []).map((j) => {
        const base = apiJobToListing(j);
        const at = appliedByJobId.get(j.id);
        return {
          ...base,
          applied: at !== undefined,
          appliedAt: at ?? null,
        };
      }),
    [jobsQuery.data, appliedByJobId],
  );

  const applyMut = useMutation({
    mutationFn: (jobId: string) =>
      applyJob(jobId, {
        cover_letter: "Applied via LMS job board.",
        resume_url: null,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["jobs"] });
      await qc.invalidateQueries({ queryKey: ["my-applications"] });
      toast.success("Application submitted");
      setDetailJob(null);
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.detail : "Could not apply"),
  });

  const filtered = useMemo(() => {
    return listings.filter((j) => {
      if (filters.role !== "All roles" && j.role !== filters.role) return false;
      if (filters.type !== "All types" && j.type !== filters.type) return false;
      if (filters.location !== "All locations") {
        const loc = j.location.toLowerCase();
        const f = filters.location.toLowerCase();
        if (f === "remote") {
          if (!loc.includes("remote")) return false;
        } else if (!loc.includes(f)) {
          return false;
        }
      }
      return true;
    });
  }, [filters, listings]);

  if (jobsQuery.isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (jobsQuery.isError) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-dashed border-destructive/40 bg-destructive/5 px-6 py-10 text-center">
        <p className="font-medium text-foreground">Could not load jobs</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {jobsQuery.error instanceof ApiError ? jobsQuery.error.detail : "Try again later."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-1">
        <h1 className="lms-page-title">Job Updates</h1>
        <p className="lms-page-lead mt-1">
          Curated roles aligned with analytics, ML, and data engineering paths.
        </p>
      </header>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-64">
          <JobFilters value={filters} onChange={setFilters} />
        </aside>

        <div className="min-w-0 flex-1">
          <p className="mb-4 text-sm text-muted-foreground">
            <span className="font-medium tabular-nums text-foreground">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "role" : "roles"}
          </p>
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/30 px-6 py-14 text-center">
              <p className="font-medium text-foreground">No roles match your filters</p>
              <p className="mt-2 text-sm text-muted-foreground">Try widening role, location, or type.</p>
            </div>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2">
              {filtered.map((job) => (
                <li key={job.id}>
                  <JobCard job={job} onViewDetails={setDetailJob} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <JobDetailModal
        job={detailJob}
        onClose={() => setDetailJob(null)}
        onApply={(job) => {
          if (job.applied) return;
          applyMut.mutate(job.id);
        }}
        applyPending={applyMut.isPending}
      />
    </div>
  );
}
