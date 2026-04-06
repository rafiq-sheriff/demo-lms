import Link from "next/link";

import { SectionContainer } from "@/components/layout/section-container";

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-gradient-to-b from-muted/50 via-background to-background">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgb(99_102_241/0.08),transparent)]"
        aria-hidden
      />
      <div className="relative py-16 sm:py-20 lg:py-24">
        <SectionContainer className="text-center">
          <h2 className="text-balance text-[1.75rem] font-semibold leading-[1.12] tracking-[-0.03em] text-foreground sm:text-3xl sm:leading-[1.1] md:text-[2.25rem]">
            Build Your Ai Portfolio like the Top 5% Data Experts
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg sm:leading-relaxed">
            From the team of Indian Data Experts.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center sm:mt-10">
            <Link
              href="/courses"
              className="group relative inline-flex min-h-[3rem] items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-10 text-[15px] font-semibold text-primary-foreground shadow-sm ring-1 ring-primary/10 transition hover:bg-primary/90 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:translate-y-px"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5 opacity-0 transition group-hover:opacity-100" />
              <span className="relative">Explore All Programs</span>
              <span
                aria-hidden
                className="relative text-lg font-light leading-none transition group-hover:translate-x-0.5"
              >
                &gt;
              </span>
            </Link>
          </div>
        </SectionContainer>
      </div>
    </section>
  );
}
