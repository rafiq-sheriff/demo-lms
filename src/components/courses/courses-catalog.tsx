"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { CourseCard } from "@/components/home/course-card";
import { Button } from "@/components/ui/button";
import { ApiError, getCourses, type CourseOut } from "@/lib/api";
import { cn } from "@/lib/utils";

type SortKey = "newest" | "title";

function sortCourses(list: CourseOut[], sort: SortKey): CourseOut[] {
  const out = [...list];
  if (sort === "newest") {
    out.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else {
    out.sort((a, b) => a.title.localeCompare(b.title));
  }
  return out;
}

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-[320px] animate-pulse rounded-xl border border-border/60 bg-muted/40"
        />
      ))}
    </div>
  );
}

export function CoursesCatalog() {
  const [sort, setSort] = useState<SortKey>("newest");

  const query = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
  });

  const courses = useMemo(() => {
    if (!query.data?.length) return [];
    return sortCourses(query.data, sort);
  }, [query.data, sort]);

  const count = courses.length;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 pt-8 sm:px-6 lg:flex-row lg:gap-10 lg:px-8 lg:pt-10">
      <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-64 lg:self-start">
        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm ring-1 ring-foreground/[0.04]">
          <p className="text-sm font-semibold text-foreground">Browse</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Courses are loaded from the LMS API. Sign in to enroll and track progress in your
            dashboard.
          </p>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="lms-page-title">All Courses</h1>
            <p className="lms-page-lead mt-1">
              {query.isLoading ? (
                "Loading courses…"
              ) : (
                <>
                  <span className="font-medium tabular-nums text-foreground">{count}</span>{" "}
                  {count === 1 ? "course" : "courses"}
                </>
              )}
            </p>
          </div>
          <div className="flex flex-col gap-1.5 sm:items-end">
            <label htmlFor="sort-courses" className="text-xs font-medium text-muted-foreground">
              Sort
            </label>
            <select
              id="sort-courses"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              disabled={query.isLoading || query.isError}
              className={cn(
                "h-11 min-w-[12rem] rounded-xl border border-border/80 bg-card px-3 text-sm font-medium text-foreground shadow-sm outline-none ring-0 transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20",
                (query.isLoading || query.isError) && "opacity-60",
              )}
            >
              <option value="newest">Newest</option>
              <option value="title">Title (A–Z)</option>
            </select>
          </div>
        </div>

        {query.isLoading ? (
          <div className="mt-8">
            <CatalogSkeleton />
          </div>
        ) : null}

        {query.isError ? (
          <div className="mt-8 rounded-xl border border-dashed border-destructive/40 bg-destructive/5 px-6 py-10 text-center">
            <p className="font-medium text-foreground">Could not load courses</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {query.error instanceof ApiError
                ? query.error.detail
                : "Check NEXT_PUBLIC_API_URL and that the API is running."}
            </p>
            <Button type="button" className="mt-4 rounded-xl" onClick={() => void query.refetch()}>
              Retry
            </Button>
          </div>
        ) : null}

        {!query.isLoading && !query.isError && count === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-border/80 bg-muted/30 px-6 py-14 text-center">
            <p className="font-medium text-foreground">No courses yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Ask an admin to create courses in the API, then refresh this page.
            </p>
          </div>
        ) : null}

        {!query.isLoading && !query.isError && count > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                variant="catalog"
                courseId={course.id}
                title={course.title}
                price={course.is_free ? "Free" : "Premium"}
                rating={4.8}
                lessons={course.lesson_count ?? 0}
                isFree={course.is_free}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
