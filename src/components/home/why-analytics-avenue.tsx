import { SectionContainer } from "@/components/layout/section-container";
import { whyAnalyticsAvenue } from "@/lib/home-data";

export function WhyAnalyticsAvenue() {
  return (
    <section className="border-b border-border/70 bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-pink-50/50 py-14 sm:py-16 lg:py-20">
      <div>
        <SectionContainer narrow className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {whyAnalyticsAvenue.heading}
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {whyAnalyticsAvenue.body}
          </p>
        </SectionContainer>
      </div>
    </section>
  );
}
