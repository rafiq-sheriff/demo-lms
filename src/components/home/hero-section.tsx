import Link from "next/link";
import { ArrowRight, Sparkles, Star, Trophy, TrendingUp } from "lucide-react";

import { HeroKeywords } from "@/components/home/hero-keywords";
import { SectionContainer } from "@/components/layout/section-container";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/70 bg-background">
      <div
        className="pointer-events-none absolute left-[-15%] top-10 h-72 w-72 rounded-full bg-purple-300/30 blur-3xl animate-blob"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[-10%] top-24 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl animate-blob animation-delay-2000"
        aria-hidden
      />

      <SectionContainer className="relative pb-16 pt-12 sm:pt-14 lg:pb-20 lg:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="mx-auto max-w-xl text-center lg:mx-0 lg:max-w-none lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span className="text-sm text-indigo-700">AI-Powered Learning Platform</span>
            </div>
            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Build Your{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Career
              </span>{" "}
              Portfolio
            </h1>
            <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground sm:text-xl">
              Master AI and machine learning with real-world projects, mentorship, and job-ready
              outcomes.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link
                href="#programs"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-7 text-[15px] font-semibold text-white shadow-sm transition hover:shadow-md"
              >
                Explore All Programs
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/courses"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-card px-7 text-[15px] font-semibold text-foreground transition hover:bg-muted/50"
              >
                View Course Catalog
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm lg:justify-start">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Trophy className="h-4 w-4 text-indigo-600" />
                <span>5000+ learners</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-foreground">4.9</span>
                <span>(2.3k reviews)</span>
              </div>
            </div>
            <HeroKeywords />
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-indigo-50 via-white to-purple-50 shadow-xl"
              aria-hidden
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgb(99_102_241/0.18),transparent_45%,rgb(139_92_246/0.14))]" />
              <div className="absolute inset-7 rounded-xl border border-white/60 bg-white/70 p-5 backdrop-blur-sm">
                <div className="mb-4 grid grid-cols-3 gap-2">
                  <div className="h-16 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-50" />
                  <div className="h-16 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50" />
                  <div className="h-16 rounded-lg bg-gradient-to-br from-pink-100 to-pink-50" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-3/4 rounded-md bg-indigo-200" />
                  <div className="h-3 w-full rounded-md bg-zinc-200" />
                  <div className="h-3 w-5/6 rounded-md bg-zinc-200" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 rounded-xl border border-border/70 bg-card p-3 shadow-lg">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-emerald-100 p-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Placement</p>
                  <p className="text-base font-bold text-foreground">94%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
