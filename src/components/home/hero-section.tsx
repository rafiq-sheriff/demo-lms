import Link from "next/link";
import { HeroKeywords } from "@/components/home/hero-keywords";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-slate-50 via-white to-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgb(99 102 241 / 0.18), transparent 45%), radial-gradient(circle at 80% 0%, rgb(139 92 246 / 0.15), transparent 40%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-14 sm:pb-24 sm:pt-20 lg:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Build Your Ai Portfolio like the Top 5% Data Experts
          </h1>
          <p className="mt-5 text-pretty text-lg text-slate-600 sm:text-xl">
            From the team of Indian Data Experts.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="#programs"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Explore All Programs
              <span aria-hidden className="text-lg leading-none">
                &gt;
              </span>
            </Link>
          </div>
          <HeroKeywords />
        </div>
      </div>
    </section>
  );
}
