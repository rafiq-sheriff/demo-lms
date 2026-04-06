"use client";

import { Check, Circle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CourseDetail, CourseLesson } from "@/lib/course-detail";

export type CourseCurriculumProps = {
  course: CourseDetail;
  activeLessonId: string;
  completedLessonIds: ReadonlySet<string>;
  onSelectLesson: (lesson: CourseLesson) => void;
  onToggleComplete: (lessonId: string) => void;
};

export function CourseCurriculum({
  course,
  activeLessonId,
  completedLessonIds,
  onSelectLesson,
  onToggleComplete,
}: CourseCurriculumProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-foreground">Course curriculum</h2>
      <div className="space-y-2">
        {course.modules.map((mod, mi) => (
          <details
            key={mod.title}
            className="group rounded-xl border border-border/80 bg-card shadow-sm open:ring-1 open:ring-primary/10"
            open={mi === 0}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-foreground outline-none transition hover:bg-muted/50 [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 truncate">{mod.title}</span>
              <span className="shrink-0 text-xs font-normal tabular-nums text-muted-foreground">
                {mod.lessons.length} lessons
              </span>
            </summary>
            <ul className="border-t border-border/60 px-2 py-1">
              {mod.lessons.map((lesson) => {
                const isActive = lesson.id === activeLessonId;
                const isDone = completedLessonIds.has(lesson.id);
                return (
                  <li key={lesson.id}>
                    <div
                      className={cn(
                        "flex items-start gap-2 rounded-lg px-2 py-2 transition-colors",
                        isActive ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted/50"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectLesson(lesson)}
                        className="min-w-0 flex-1 text-left text-sm leading-snug"
                      >
                        <span
                          className={cn(
                            "font-medium",
                            isActive ? "text-primary" : "text-foreground"
                          )}
                        >
                          {lesson.title}
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label={isDone ? "Mark as incomplete" : "Mark as complete"}
                        aria-pressed={isDone}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComplete(lesson.id);
                        }}
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition",
                          isDone
                            ? "border-primary/40 bg-primary text-primary-foreground"
                            : "border-border/80 bg-muted/40 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                        )}
                      >
                        {isDone ? (
                          <Check className="h-4 w-4" aria-hidden />
                        ) : (
                          <Circle className="h-4 w-4" aria-hidden />
                        )}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}
