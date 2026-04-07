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
    <section aria-labelledby="experts-heading" className="border-b border-border/70 bg-background py-14 sm:py-16 lg:py-20">
      <div>
        <SectionContainer>
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="experts-heading"
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              Success Stories
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Hear from experts and learners who transformed their careers.
            </p>
          </div>
          <ul className="mt-10 grid gap-5 sm:mt-12 md:grid-cols-3">
            {items.map((feature) => (
              <li key={feature.title}>
                <Card className="h-full rounded-2xl border-border/70 bg-card shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent className="pt-6">
                    <p className="text-sm text-amber-500">★★★★★</p>
                    <p className="mt-3 text-[15px] font-semibold leading-snug tracking-tight text-foreground">
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
