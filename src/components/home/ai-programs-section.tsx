"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { CourseCard } from "@/components/home/course-card";
import { SectionContainer } from "@/components/layout/section-container";
import { getCourses } from "@/lib/api";
import { aiPrograms, homeProgramsPreviewCount } from "@/lib/home-data";

function ProgramsSkeleton() {
  return (
    <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {Array.from({ length: homeProgramsPreviewCount }).map((_, i) => (
        <div
          key={i}
          className="h-[280px] animate-pulse rounded-xl border border-border/60 bg-muted/40"
        />
      ))}
    </div>
  );
}

export function AiProgramsSection() {
  const coursesQuery = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
    staleTime: 60_000,
  });

  const apiCourses = coursesQuery.data;
  const showLiveCatalog =
    !coursesQuery.isLoading && !coursesQuery.isError && apiCourses && apiCourses.length > 0;

  const previewStatic = aiPrograms.slice(0, homeProgramsPreviewCount);

  return (
    <section
      id="programs"
      className="relative border-b border-border/80 bg-gradient-to-b from-muted/40 via-background to-background"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        aria-hidden
      />
      <div className="py-14 sm:py-16 lg:py-20">
        <SectionContainer>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-[2rem]">
              AI Programs
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
              Structured tracks with clear pricing, ratings, and lesson counts—pick what matches your
              goals.
            </p>
          </div>

          {coursesQuery.isLoading ? <ProgramsSkeleton /> : null}

          {!coursesQuery.isLoading && showLiveCatalog ? (
            <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {apiCourses.slice(0, homeProgramsPreviewCount).map((c) => (
                <CourseCard
                  key={c.id}
                  courseId={c.id}
                  title={c.title}
                  price={c.is_free ? "Free" : "Premium"}
                  rating={4.8}
                  lessons={c.lesson_count ?? 0}
                  isFree={c.is_free}
                />
              ))}
            </div>
          ) : null}

          {!coursesQuery.isLoading && !showLiveCatalog ? (
            <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {previewStatic.map((course) => (
                <CourseCard
                  key={course.id}
                  courseId={course.id}
                  title={course.title}
                  price={course.price}
                  rating={course.rating}
                  lessons={course.lessons}
                  isFree={course.isFree === true}
                />
              ))}
            </div>
          ) : null}

          <div className="mt-10 flex justify-center sm:mt-12">
            <Link
              href="/courses"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-sm ring-1 ring-primary/10 transition hover:bg-primary/90 hover:shadow-md"
            >
              View All Programs
            </Link>
          </div>
        </SectionContainer>
      </div>
    </section>
  );
}
