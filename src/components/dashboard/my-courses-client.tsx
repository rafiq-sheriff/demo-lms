"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { BookMarked } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { buttonVariants } from "@/components/ui/button";
import { ApiError, getMyCourses } from "@/lib/api";
import { cn } from "@/lib/utils";

export function MyCoursesClient() {
  const q = useQuery({
    queryKey: ["my-courses"],
    queryFn: getMyCourses,
  });

  if (q.isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (q.isError) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-dashed border-destructive/40 bg-destructive/5 px-6 py-10 text-center">
        <p className="font-medium text-foreground">Could not load your courses</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {q.error instanceof ApiError ? q.error.detail : "Try signing in again."}
        </p>
      </div>
    );
  }

  const courses = q.data ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-1">
        <h1 className="lms-page-title">My Courses</h1>
        <p className="lms-page-lead mt-1">
          Continue learning where you left off. Open the course player to track lesson progress.
        </p>
      </header>

      {courses.length === 0 ? (
        <DashboardCard title="No enrollments yet" description="Browse the catalog and enroll in a program">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              When you enroll, your courses will show up here with quick access to the player.
            </p>
            <Link href="/courses" className={cn(buttonVariants({ size: "lg" }), "rounded-xl")}>
              Browse courses
            </Link>
          </div>
        </DashboardCard>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2">
          {courses.map((c) => (
            <li key={c.id}>
              <DashboardCard title={c.title} description="Enrolled program">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <BookMarked className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>{c.description?.slice(0, 140) ?? "Open the player to continue lessons."}</span>
                  </div>
                  <Link
                    href={`/dashboard/course/${c.id}`}
                    className={cn(buttonVariants({ size: "default" }), "shrink-0 rounded-xl")}
                  >
                    Open course
                  </Link>
                </div>
              </DashboardCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
