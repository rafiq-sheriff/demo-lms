import type { CourseDetail as ApiCourseDetail } from "@/lib/api";
import type { CourseDetail, CourseLesson, CourseModule, CourseResource } from "@/lib/course-detail";

const DEFAULT_EMBED_ID = "ScMzIvxBSi4";

const defaultResources: CourseResource[] = [
  { label: "Course syllabus", href: "#" },
  { label: "Module resources", href: "#" },
];

/**
 * Extract YouTube video id from lesson HTML/text or return default.
 */
export function extractYoutubeEmbedId(content: string | null): string {
  if (!content) return DEFAULT_EMBED_ID;
  const embed = content.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (embed?.[1]) return embed[1];
  const short = content.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (short?.[1]) return short[1];
  const watch = content.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watch?.[1]) return watch[1];
  return DEFAULT_EMBED_ID;
}

function lessonCount(course: ApiCourseDetail): number {
  return course.modules.reduce((n, m) => n + m.lessons.length, 0);
}

/**
 * Map API course payload to the player/marketing `CourseDetail` shape.
 */
export function apiCourseToPlayerDetail(course: ApiCourseDetail): CourseDetail {
  const firstContent = course.modules[0]?.lessons[0]?.content ?? null;
  const embedId = extractYoutubeEmbedId(firstContent);

  const modules: CourseModule[] = [...course.modules]
    .sort((a, b) => a.order_index - b.order_index)
    .map((mod, mi) => {
      const lessons: CourseLesson[] = [...mod.lessons]
        .sort((a, b) => a.order_index - b.order_index)
        .map((lesson, li) => {
          const lessonEmbed = extractYoutubeEmbedId(lesson.content);
          const sameAsDefault = lessonEmbed === embedId;
          return {
            id: lesson.id,
            title: lesson.title,
            startSeconds: sameAsDefault ? li * 60 + mi * 30 : 0,
            youtubeEmbedId: sameAsDefault ? undefined : lessonEmbed,
          };
        });
      return {
        title: mod.title,
        lessons,
      };
    });

  return {
    id: course.id,
    title: course.title,
    price: course.is_free ? "Free" : "Paid",
    isFree: course.is_free,
    rating: 4.8,
    lessons: lessonCount(course),
    youtubeEmbedId: embedId,
    modules,
    overview: course.description?.trim() || "Course overview will appear here.",
    resources: defaultResources,
    instructor: {
      nameLine: "Course instructor",
      roleLine: "Instructor",
      bio: course.description?.trim() || "",
    },
  };
}
