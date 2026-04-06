import { aiPrograms, stats, whyAnalyticsAvenue } from "@/lib/home-data";

export type CourseLesson = {
  id: string;
  title: string;
  /** YouTube `start` param (seconds) when switching lessons in the player. */
  startSeconds: number;
  /** Per-lesson video when different from the course default. */
  youtubeEmbedId?: string;
};

export type CourseModule = {
  title: string;
  lessons: CourseLesson[];
};

export type CourseResource = {
  label: string;
  href: string;
};

export type CourseDetail = {
  id: string;
  title: string;
  price: string;
  rating: number;
  lessons: number;
  youtubeEmbedId: string;
  /** Homepage / catalog: free tier (no payment). */
  isFree?: boolean;
  modules: CourseModule[];
  /** Long-form overview for course player / marketing. */
  overview: string;
  resources: CourseResource[];
  instructor: {
    nameLine: string;
    roleLine: string;
    bio: string;
  };
};

/** Default preview when a lesson has no embed. */
const DEFAULT_EMBED_ID = "ScMzIvxBSi4";

/** Curated educational videos (data, analytics, ML, SQL, Python) — rotated across lessons. */
const YOUTUBE_RELATED_POOL = [
  "HXV3zeQKqGY",
  "rfscVS0vtbw",
  "RBSGKlAvoiM",
  "ua-CiDNNj30",
  "8jPQjjsBbIc",
  "PPLop4L2eGk",
  "aircAruvnKk",
  "xk4_1vDrzzo",
  "vmEHCJyBW8Y",
  "qBigTkBLVwA",
] as const;

function embedIdForLessonIndex(index: number): string {
  return YOUTUBE_RELATED_POOL[index % YOUTUBE_RELATED_POOL.length];
}

function buildModules(lessonCount: number, courseId: string): CourseModule[] {
  const moduleCount = 3;
  const base = Math.floor(lessonCount / moduleCount);
  const remainder = lessonCount % moduleCount;
  const sizes: number[] = [];
  for (let i = 0; i < moduleCount; i++) {
    sizes.push(base + (i < remainder ? 1 : 0));
  }
  let offset = 0;
  return sizes.map((size, mi) => {
    const lessons: CourseLesson[] = Array.from({ length: size }, (_, i) => {
      const n = offset + i + 1;
      const idx = n - 1;
      return {
        id: `${courseId}-m${mi + 1}-l${n}`,
        title: `Lesson ${n}`,
        startSeconds: 0,
        youtubeEmbedId: embedIdForLessonIndex(idx),
      };
    });
    offset += size;
    return {
      title: `Module ${mi + 1}`,
      lessons,
    };
  });
}

const defaultResources: CourseResource[] = [
  { label: "Course syllabus", href: "#" },
  { label: "Dataset bundle", href: "#" },
  { label: "Notebook templates", href: "#" },
];

export function getCourseIds(): string[] {
  return aiPrograms.map((p) => p.id);
}

export function countLessons(course: CourseDetail): number {
  return course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
}

export function getCourseDetail(id: string): CourseDetail | null {
  const program = aiPrograms.find((p) => p.id === id);
  if (!program) return null;

  const firstEmbed = embedIdForLessonIndex(0);
  return {
    id: program.id,
    title: program.title,
    price: program.price,
    rating: program.rating,
    lessons: program.lessons,
    isFree: program.isFree === true,
    youtubeEmbedId: firstEmbed,
    modules: buildModules(program.lessons, program.id),
    overview: whyAnalyticsAvenue.body,
    resources: defaultResources,
    instructor: {
      nameLine: `${stats[3].value} ${stats[3].label}`,
      roleLine: "From the team of Indian Data Experts.",
      bio: whyAnalyticsAvenue.body,
    },
  };
}
