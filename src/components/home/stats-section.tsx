import { SectionContainer } from "@/components/layout/section-container";
import { stats } from "@/lib/home-data";

export function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 py-12 text-white sm:py-14 lg:py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgb(99_102_241/0.35),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_100%,rgb(139_92_246/0.12),transparent)]"
        aria-hidden
      />
      <SectionContainer className="relative">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-sm ring-1 ring-white/5 sm:p-10 lg:p-12">
          <div className="grid gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-4 lg:gap-8">
            {stats.map((item) => (
              <div key={item.label} className="text-center sm:text-left">
                <p className="text-[2.25rem] font-semibold leading-none tracking-[-0.03em] tabular-nums sm:text-4xl lg:text-[2.5rem]">
                  {item.value}
                </p>
                <p className="mt-3 text-[13px] font-medium leading-snug tracking-wide text-zinc-400 sm:text-sm">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
