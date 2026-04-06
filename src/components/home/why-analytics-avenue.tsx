import { SectionContainer } from "@/components/layout/section-container";
import { whyAnalyticsAvenue } from "@/lib/home-data";

export function WhyAnalyticsAvenue() {
  return (
    <section className="relative border-b border-border/80 bg-muted/40">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
        aria-hidden
      />
      <div className="py-14 sm:py-16 lg:py-20">
        <SectionContainer narrow className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-[2rem] md:leading-tight">
            {whyAnalyticsAvenue.heading}
          </h2>
          <p className="mt-5 text-pretty text-[15px] leading-[1.7] text-muted-foreground sm:text-base sm:leading-relaxed">
            {whyAnalyticsAvenue.body}
          </p>
        </SectionContainer>
      </div>
    </section>
  );
}
