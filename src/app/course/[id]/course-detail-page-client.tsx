"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AnnouncementBar } from "@/components/home/announcement-bar";
import { Navbar } from "@/components/home/navbar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionContainer } from "@/components/layout/section-container";
import { apiCourseToPlayerDetail, extractYoutubeEmbedId } from "@/lib/course-from-api";
import {
  ApiError,
  enrollCourse,
  getCourse,
  getMyCourses,
  type CourseDetail as ApiCourseDetail,
} from "@/lib/api";
import { getCourseDetail, type CourseDetail } from "@/lib/course-detail";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

type Props = {
  courseId: string;
};

function CourseDetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-4 w-48 rounded bg-muted" />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="aspect-video rounded-xl bg-muted" />
        <div className="h-72 rounded-xl bg-muted" />
      </div>
    </div>
  );
}

export function CourseDetailPageClient({ courseId }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const { isAuthenticated } = useAuth();

  const myCoursesQuery = useQuery({
    queryKey: ["my-courses"],
    queryFn: getMyCourses,
    enabled: isAuthenticated,
  });

  const apiQuery = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourse(courseId),
    retry: false,
  });

  const staticDetail = useMemo(() => getCourseDetail(courseId), [courseId]);

  const resolved = useMemo(() => {
    if (apiQuery.data) {
      const d = apiCourseToPlayerDetail(apiQuery.data);
      return { source: "api" as const, api: apiQuery.data, display: d };
    }
    if (!apiQuery.isLoading && staticDetail) {
      return { source: "static" as const, api: null as ApiCourseDetail | null, display: staticDetail };
    }
    return null;
  }, [apiQuery.data, apiQuery.isLoading, staticDetail]);

  const enrollMutation = useMutation({
    mutationFn: () => enrollCourse(courseId),
    onSuccess: async () => {
      toast.success("You’re enrolled");
      await qc.invalidateQueries({ queryKey: ["my-courses"] });
      router.push("/dashboard/my-courses");
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.detail : "Could not enroll");
    },
  });

  if (apiQuery.isLoading) {
    return (
      <div className="flex min-h-full flex-col bg-muted/30">
        <AnnouncementBar />
        <Navbar />
        <main className="flex-1 pb-16">
          <CourseDetailSkeleton />
        </main>
      </div>
    );
  }

  if (!resolved) {
    return (
      <div className="flex min-h-full flex-col bg-muted/30">
        <AnnouncementBar />
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4 pb-16 pt-10">
          <Card className="max-w-md rounded-xl border-border/80">
            <CardHeader>
              <CardTitle>Course not found</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We couldn&apos;t load this program from the API or local catalog.
              </p>
              <Link href="/courses" className={cn(buttonVariants({ size: "lg" }), "rounded-xl")}>
                Back to courses
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const course: CourseDetail = resolved.display;
  const isEnrolled =
    resolved.source === "api" && myCoursesQuery.data?.some((c) => c.id === courseId) === true;

  const firstEmbed =
    resolved.source === "api" && resolved.api
      ? extractYoutubeEmbedId(resolved.api.modules[0]?.lessons[0]?.content ?? null)
      : course.modules[0]?.lessons[0]?.youtubeEmbedId ?? course.youtubeEmbedId;

  function handleEnroll() {
    if (!resolved) return;
    if (resolved.source !== "api") {
      if (isAuthenticated) {
        toast.info("This URL is a preview. Use All Courses to open a real program and enroll.");
        router.push("/courses");
        return;
      }
      toast.message("Sign in, then enroll from All Courses.");
      router.push(`/login?next=${encodeURIComponent("/courses")}`);
      return;
    }
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(`/course/${courseId}`)}`);
      return;
    }
    if (isEnrolled) {
      router.push(`/dashboard/course/${courseId}`);
      return;
    }
    enrollMutation.mutate();
  }

  return (
    <div className="flex min-h-full flex-col bg-muted/30 text-foreground antialiased">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1 pb-16">
        <SectionContainer className="pt-8 sm:pt-10 lg:pt-12">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <Link href="/courses" className="font-medium text-foreground hover:underline">
              All Courses
            </Link>
            <span className="mx-2 text-muted-foreground/80">/</span>
            <span className="text-muted-foreground">{course.title}</span>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
            <div className="space-y-6">
              <div className="overflow-hidden rounded-xl border border-border/80 bg-black shadow-sm ring-1 ring-foreground/[0.04]">
                <div className="relative aspect-video w-full">
                  <iframe
                    title={`${course.title} preview`}
                    src={`https://www.youtube.com/embed/${firstEmbed}`}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>

              <Card className="rounded-xl border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold sm:text-xl">Curriculum</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {course.modules.map((mod) => (
                    <details
                      key={mod.title}
                      className="group rounded-xl border border-border/80 bg-muted/20 open:bg-card"
                    >
                      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-foreground outline-none ring-0 transition hover:bg-muted/40 [&::-webkit-details-marker]:hidden">
                        <span className="flex items-center justify-between gap-3">
                          {mod.title}
                          <span className="text-xs font-normal text-muted-foreground tabular-nums">
                            {mod.lessons.length} lessons
                          </span>
                        </span>
                      </summary>
                      <ul className="border-t border-border/60 px-4 py-3 text-sm text-muted-foreground">
                        {mod.lessons.map((lesson) => (
                          <li key={lesson.id} className="border-b border-border/40 py-2 last:border-0">
                            {lesson.title}
                          </li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
              <Card className="rounded-xl border-border/80 shadow-sm">
                <CardHeader className="space-y-3">
                  <CardTitle className="text-2xl font-semibold leading-tight tracking-tight sm:text-[1.65rem]">
                    {course.title}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                      <span className="text-amber-500" aria-hidden>
                        ★
                      </span>
                      <span className="tabular-nums">{course.rating.toFixed(1)}</span>
                    </span>
                    <span className="text-muted-foreground">
                      <span className="font-semibold tabular-nums text-foreground">{course.lessons}</span>{" "}
                      lessons
                    </span>
                  </div>
                  <p className="text-2xl font-bold tabular-nums text-primary">
                    {course.isFree ? "Free" : course.price}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <button
                    type="button"
                    onClick={handleEnroll}
                    disabled={
                      enrollMutation.isPending ||
                      (Boolean(isAuthenticated && resolved.source === "api" && myCoursesQuery.isLoading && !isEnrolled))
                    }
                    className={cn(
                      "inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-4 text-[15px] font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60",
                    )}
                  >
                    {resolved.source === "api" && myCoursesQuery.isLoading && isAuthenticated
                      ? "Checking enrollment…"
                      : enrollMutation.isPending
                        ? "Enrolling…"
                        : isEnrolled && resolved.source === "api"
                          ? "Continue learning"
                          : course.isFree || (resolved.source === "api" && resolved.api?.is_free)
                            ? "Enroll free"
                            : "Enroll"}
                  </button>
                  <p className="text-center text-xs text-muted-foreground">
                    {resolved.source === "api"
                      ? isEnrolled
                        ? "You’re enrolled — open the player to pick up where you left off."
                        : "Enrolling adds this course to your dashboard."
                      : "Preview only—open All Courses for live programs you can enroll in."}
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-border/80 bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Instructor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p className="font-semibold text-foreground">{course.instructor.nameLine}</p>
                  <p className="text-muted-foreground">{course.instructor.roleLine}</p>
                  <p className="text-muted-foreground">{course.instructor.bio}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </SectionContainer>
      </main>
    </div>
  );
}
