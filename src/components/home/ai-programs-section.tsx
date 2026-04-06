import { CourseCard } from "@/components/home/course-card";
import { aiPrograms } from "@/lib/home-data";

export function AiProgramsSection() {
  return (
    <section id="programs" className="border-b border-slate-200/80 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            AI Programs
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Structured tracks with clear pricing, ratings, and lesson counts—pick what matches your
            goals.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {aiPrograms.map((course) => (
            <CourseCard
              key={course.title}
              title={course.title}
              price={course.price}
              rating={course.rating}
              lessons={course.lessons}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
