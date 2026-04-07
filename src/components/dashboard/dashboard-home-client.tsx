"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight, BookMarked, CheckCircle2, Clock } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { getMyCourseProgress, getMyCourses, getMySubmissions, getTasks } from "@/lib/api";
import { cn } from "@/lib/utils";

function formatDue(iso: string | null | undefined): string {
  if (!iso) return "No deadline";
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return iso;
  }
}

export function DashboardHomeClient() {
  const { user } = useAuth();
  const myCourses = useQuery({ queryKey: ["my-courses"], queryFn: getMyCourses });
  const tasks = useQuery({ queryKey: ["tasks"], queryFn: () => getTasks() });
  const subs = useQuery({ queryKey: ["my-submissions"], queryFn: getMySubmissions });

  const progressQueries = useQueries({
    queries: (myCourses.data ?? []).map((c) => ({
      queryKey: ["course-progress", c.id],
      queryFn: () => getMyCourseProgress(c.id),
      enabled: Boolean(myCourses.data?.length),
    })),
  });

  const firstName = user?.full_name?.split(/\s+/)[0] ?? "there";

  const upcomingTasks = (tasks.data ?? []).slice(0, 4).map((t) => ({
    title: t.title,
    due: formatDue(t.due_at),
    course: "Your program",
  }));

  const progressList = (myCourses.data ?? []).slice(0, 3);
  const progressCourses = progressList.map((c, i) => {
    const prog = progressQueries[i]?.data ?? [];
    const completed = prog.filter((p) => p.progress_percent >= 100 || p.completed_at).length;
    const total = Math.max(c.lesson_count ?? 0, 0);
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    return {
      id: c.id,
      title: c.title,
      progress,
      next:
        total === 0
          ? "No lessons yet"
          : progress >= 100
            ? "Course complete — review anytime"
            : "Open the player to continue",
    };
  });

  const progressSyncing =
    progressList.length > 0 && progressQueries.some((q) => q.isPending || q.isLoading);

  const recentActivity = (subs.data ?? []).slice(0, 3).map((s) => ({
    text: `Submission updated for a task`,
    time: new Date(s.submitted_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }),
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="rounded-2xl border border-border/80 bg-gradient-to-br from-primary/10 via-card to-muted/30 p-6 shadow-sm ring-1 ring-foreground/[0.04] sm:p-8">
        <p className="text-sm font-medium text-primary">Welcome back</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Hi {firstName} — here&apos;s your learning snapshot
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Pick up where you left off, stay on top of tasks, and keep momentum toward your portfolio
          goals.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard/my-courses"
            className={cn(buttonVariants({ size: "lg" }), "rounded-xl gap-2")}
          >
            Continue learning
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/dashboard/tasks"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-xl")}
          >
            View tasks
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardCard title="Course progress" description="Enrolled programs">
            {myCourses.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : progressCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No enrollments yet.{" "}
                <Link href="/courses" className="font-medium text-primary hover:underline">
                  Browse courses
                </Link>
                .
              </p>
            ) : (
              <ul className="space-y-5">
                {progressCourses.map((c) => (
                  <li key={c.id} className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-2">
                        <BookMarked className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                        <div className="min-w-0">
                          <Link
                            href={`/dashboard/course/${c.id}`}
                            className="font-medium leading-snug text-foreground hover:text-primary hover:underline"
                          >
                            {c.title}
                          </Link>
                          <p className="text-xs text-muted-foreground">Next: {c.next}</p>
                        </div>
                      </div>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                        {progressSyncing ? "…" : `${c.progress}%`}
                      </span>
                    </div>
                    <div
                      className="h-2 overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-valuenow={c.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full rounded-full bg-primary transition-[width]"
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </DashboardCard>
        </div>

        <DashboardCard title="Upcoming tasks" description="Stay ahead of deadlines">
          {tasks.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : upcomingTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks published yet.</p>
          ) : (
            <ul className="space-y-4">
              {upcomingTasks.map((t) => (
                <li
                  key={t.title}
                  className="flex gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5"
                >
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug text-foreground">{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.due} · {t.course}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>
      </section>

      <DashboardCard title="Recent activity" description="Latest updates">
        {subs.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : recentActivity.length === 0 ? (
          <p className="text-sm text-muted-foreground">Submit a task or complete a lesson to see activity.</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {recentActivity.map((item, idx) => (
              <li
                key={`${item.text}-${idx}`}
                className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <p className="text-sm text-foreground">{item.text}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>
    </div>
  );
}
