"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { CourseCurriculum } from "@/components/course-player/course-curriculum";
import { CourseTabs } from "@/components/course-player/course-tabs";
import { ProgressBar } from "@/components/course-player/progress-bar";
import { VideoPlayer } from "@/components/course-player/video-player";
import { Card, CardContent } from "@/components/ui/card";
import { ApiError, getMyCourseProgress, upsertLessonProgress } from "@/lib/api";
import { countLessons, type CourseDetail, type CourseLesson } from "@/lib/course-detail";

type CoursePlayerShellProps = {
  course: CourseDetail;
  /** When set, completion state is loaded and saved via the LMS API. */
  apiCourseId?: string;
};

function findLesson(course: CourseDetail, id: string): CourseLesson | undefined {
  for (const m of course.modules) {
    const found = m.lessons.find((l) => l.id === id);
    if (found) return found;
  }
  return undefined;
}

export function CoursePlayerShell({ course, apiCourseId }: CoursePlayerShellProps) {
  const qc = useQueryClient();
  const firstLesson = course.modules[0]?.lessons[0];
  const [pickedLessonId, setPickedLessonId] = useState<string | null>(null);
  const activeLessonId = pickedLessonId ?? firstLesson?.id ?? "";
  const [localCompleted, setLocalCompleted] = useState<Set<string>>(() => new Set());

  const progressQuery = useQuery({
    queryKey: ["course-progress", apiCourseId],
    queryFn: () => getMyCourseProgress(apiCourseId!),
    enabled: Boolean(apiCourseId),
  });

  const progressMutation = useMutation({
    mutationFn: async ({ lessonId, complete }: { lessonId: string; complete: boolean }) => {
      await upsertLessonProgress(lessonId, {
        progress_percent: complete ? 100 : 0,
        mark_complete: complete,
      });
    },
    onSuccess: async () => {
      if (apiCourseId) {
        await qc.invalidateQueries({ queryKey: ["course-progress", apiCourseId] });
      }
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.detail : "Could not update progress");
    },
  });

  const apiCompletedIds = useMemo(() => {
    const set = new Set<string>();
    if (progressQuery.data) {
      for (const p of progressQuery.data) {
        if (p.progress_percent >= 100 || p.completed_at) set.add(p.lesson_id);
      }
    }
    return set;
  }, [progressQuery.data]);

  const completedLessonIds = apiCourseId ? apiCompletedIds : localCompleted;

  const totalLessons = useMemo(() => countLessons(course), [course]);

  const activeLesson = useMemo(() => {
    return findLesson(course, activeLessonId) ?? firstLesson;
  }, [course, activeLessonId, firstLesson]);

  const progressPercent = totalLessons ? (completedLessonIds.size / totalLessons) * 100 : 0;

  const handleSelectLesson = useCallback((lesson: CourseLesson) => {
    setPickedLessonId(lesson.id);
  }, []);

  const handleToggleComplete = useCallback(
    async (lessonId: string) => {
      const wasDone = completedLessonIds.has(lessonId);
      if (apiCourseId) {
        await progressMutation.mutateAsync({ lessonId, complete: !wasDone });
        return;
      }
      setLocalCompleted((prev) => {
        const next = new Set(prev);
        if (next.has(lessonId)) next.delete(lessonId);
        else next.add(lessonId);
        return next;
      });
    },
    [apiCourseId, completedLessonIds, progressMutation],
  );

  const videoTitle = activeLesson
    ? `${course.title} — ${activeLesson.title}`
    : course.title;

  const syncing = Boolean(apiCourseId && progressMutation.isPending);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
      >
        <Link href="/dashboard" className="font-medium text-foreground hover:underline">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
        <Link href="/dashboard/my-courses" className="font-medium text-foreground hover:underline">
          My Courses
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
        <span className="min-w-0 truncate text-muted-foreground">{course.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:items-start">
        <div className="min-w-0 space-y-6">
          <VideoPlayer
            embedId={activeLesson?.youtubeEmbedId ?? course.youtubeEmbedId}
            startSeconds={activeLesson?.youtubeEmbedId ? 0 : (activeLesson?.startSeconds ?? 0)}
            title={videoTitle}
            sticky
          />

          <div>
            <h1 className="lms-page-title">{course.title}</h1>
            {activeLesson ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Now playing: <span className="font-medium text-foreground">{activeLesson.title}</span>
              </p>
            ) : null}
          </div>

          <CourseTabs overview={course.overview} resources={course.resources} />
        </div>

        <aside className="min-w-0 space-y-6 lg:sticky lg:top-6 lg:self-start">
          <Card className="rounded-xl border-border/80 shadow-sm">
            <CardContent className="pt-6">
              <ProgressBar
                value={progressPercent}
                caption={`${completedLessonIds.size} of ${totalLessons} lessons completed`}
              />
              {apiCourseId && progressQuery.isLoading ? (
                <p className="mt-2 text-xs text-muted-foreground">Syncing progress…</p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/80 shadow-sm">
            <CardContent className="pt-6">
              <CourseCurriculum
                course={course}
                activeLessonId={activeLesson?.id ?? ""}
                completedLessonIds={completedLessonIds}
                onSelectLesson={handleSelectLesson}
                onToggleComplete={(id) => {
                  void handleToggleComplete(id);
                }}
              />
              {syncing ? (
                <p className="mt-3 text-xs text-muted-foreground">Saving…</p>
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
