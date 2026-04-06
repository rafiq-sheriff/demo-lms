"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { CoursePlayerShell } from "@/components/course-player/course-player-shell";
import { buttonVariants } from "@/components/ui/button";
import { ApiError, getCourse } from "@/lib/api";
import { apiCourseToPlayerDetail } from "@/lib/course-from-api";
import { getCourseDetail } from "@/lib/course-detail";
import { cn } from "@/lib/utils";

type Props = {
  courseId: string;
};

export function CoursePlayerPageClient({ courseId }: Props) {
  const q = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourse(courseId),
    retry: false,
  });

  const staticFallback = getCourseDetail(courseId);

  if (q.isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="aspect-video w-full animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (q.data) {
    const display = apiCourseToPlayerDetail(q.data);
    return (
      <CoursePlayerShell key={courseId} course={display} apiCourseId={courseId} />
    );
  }

  if (!q.isLoading && staticFallback) {
    return <CoursePlayerShell key={courseId} course={staticFallback} />;
  }

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-dashed border-border/80 bg-muted/30 px-6 py-12 text-center">
      <p className="font-medium text-foreground">Course not found</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {q.error instanceof ApiError ? q.error.detail : "We couldn’t load this course."}
      </p>
      <Link
        href="/dashboard/my-courses"
        className={cn(buttonVariants({ size: "lg" }), "mt-6 rounded-xl")}
      >
        Back to my courses
      </Link>
    </div>
  );
}
