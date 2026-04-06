import { Card, CardContent } from "@/components/ui/card";
import { SectionContainer } from "@/components/layout/section-container";
import { expertsSectionFeatureTitles, features } from "@/lib/home-data";

function pickExperts() {
  return expertsSectionFeatureTitles
    .map((title) => features.find((f) => f.title === title))
    .filter((f): f is (typeof features)[number] => Boolean(f));
}

export function TestimonialsExpertsSection() {
  const items = pickExperts();

  return (
    <section
      aria-labelledby="experts-heading"
      className="relative border-b border-border/80 bg-muted/40"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        aria-hidden
      />
      <div className="py-14 sm:py-16 lg:py-20">
        <SectionContainer>
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="experts-heading"
              className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-[2rem] md:leading-tight"
            >
              Testimonials / Experts
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
              From the team of Indian Data Experts.
            </p>
          </div>
          <ul className="mt-10 grid gap-5 sm:mt-12 md:grid-cols-3">
            {items.map((feature) => (
              <li key={feature.title}>
                <Card className="h-full rounded-xl border-border/80 bg-card shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent className="pt-6">
                    <p className="text-[15px] font-semibold leading-snug tracking-tight text-foreground">
                      {feature.title}
                    </p>
                    <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </SectionContainer>
      </div>
    </section>
  );
}
