import Link from "next/link";

import { HeroKeywords } from "@/components/home/hero-keywords";
import { SectionContainer } from "@/components/layout/section-container";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background">
      <div className="pointer-events-none absolute inset-0 hero-grid-bg opacity-90" aria-hidden />
      <div
        className="pointer-events-none absolute -left-1/4 top-0 h-[420px] w-[70%] rounded-full bg-[radial-gradient(closest-side,rgb(99_102_241/0.14),transparent)] blur-3xl"
        aria-hidden
      />
      
      <div
        className="pointer-events-none absolute -right-1/4 top-24 h-[380px] w-[60%] rounded-full bg-[radial-gradient(closest-side,rgb(139_92_246/0.12),transparent)] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
        aria-hidden
      />

      <SectionContainer className="relative pb-14 pt-12 sm:pb-16 sm:pt-14 lg:pb-20 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
          <div className="mx-auto max-w-xl text-center lg:mx-0 lg:max-w-none lg:text-left">
            <h1 className="text-balance text-[1.75rem] font-semibold leading-[1.12] tracking-[-0.03em] text-foreground sm:text-4xl sm:leading-[1.1] md:text-[2.5rem] lg:text-[2.75rem]">
              Build Your Ai Portfolio like the Top 5% Data Experts
            </h1>
            <p className="mt-4 text-pretty text-[15px] leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg sm:leading-relaxed">
              From the team of Indian Data Experts.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center sm:mt-10 lg:items-start">
              <Link
                href="#programs"
                className="group relative inline-flex min-h-[3rem] w-full max-w-[20rem] items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-8 text-[15px] font-semibold text-primary-foreground shadow-sm ring-1 ring-primary/10 transition hover:bg-primary/90 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:translate-y-px lg:max-w-none lg:px-10"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/15 via-transparent to-white/5 opacity-0 transition group-hover:opacity-100" />
                <span className="relative">Explore All Programs</span>
                <span
                  aria-hidden
                  className="relative text-lg font-light leading-none transition group-hover:translate-x-0.5"
                >
                  &gt;
                </span>
              </Link>
            </div>
            <HeroKeywords />
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-muted/80 via-card to-muted/40 shadow-sm ring-1 ring-foreground/[0.04] sm:aspect-[16/11]"
              aria-hidden
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgb(99_102_241/0.12),transparent_45%,rgb(139_92_246/0.1))]" />
              <div className="absolute inset-6 rounded-xl border border-white/40 bg-white/70 p-4 shadow-sm backdrop-blur-sm sm:inset-8 sm:p-6">
                <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-4">
                  <div className="flex gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
                  </div>
                  <div className="h-2 flex-1 max-w-[40%] rounded-full bg-muted" />
                </div>
                <div className="mt-5 space-y-3">
                  <div className="h-3 w-3/4 rounded-md bg-gradient-to-r from-primary/25 to-primary/5" />
                  <div className="h-3 w-full rounded-md bg-muted" />
                  <div className="h-3 w-5/6 rounded-md bg-muted" />
                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-primary/15 to-violet-500/10 ring-1 ring-primary/10" />
                    <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-violet-500/10 to-primary/10 ring-1 ring-primary/10" />
                    <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-primary/10 to-muted ring-1 ring-border/80" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <div className="h-9 flex-1 rounded-lg bg-primary/90 shadow-sm" />
                    <div className="h-9 w-20 rounded-lg border border-border/80 bg-card" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
