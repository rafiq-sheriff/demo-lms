import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

import { SectionContainer } from "@/components/layout/section-container";

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute left-6 top-6 h-56 w-56 rounded-full bg-white/20 blur-3xl animate-blob" aria-hidden />
      <div className="pointer-events-none absolute bottom-4 right-6 h-64 w-64 rounded-full bg-white/20 blur-3xl animate-blob animation-delay-2000" aria-hidden />
      <div className="relative">
        <SectionContainer className="text-center">
          <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
            Ready to Start Your AI Journey?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-white/90 sm:text-xl">
            Join thousands of learners building practical AI portfolios and getting hired faster.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10">
            <Link
              href="/courses"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 text-[15px] font-semibold text-indigo-700 shadow-sm transition hover:bg-zinc-100"
            >
              Explore All Programs
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/50 bg-white/10 px-8 text-[15px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Book a Consultation
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-6 text-sm text-white/90">
            <p className="inline-flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              No prior experience needed
            </p>
            <p className="inline-flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Portfolio-first learning
            </p>
            <p className="inline-flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Placement support
            </p>
          </div>
        </SectionContainer>
      </div>
    </section>
  );
}
