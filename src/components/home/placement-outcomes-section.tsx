import { Card, CardContent } from "@/components/ui/card";
import { SectionContainer } from "@/components/layout/section-container";
import { features, placementSectionFeatureTitles, stats } from "@/lib/home-data";

function pickPlacement() {
  return placementSectionFeatureTitles
    .map((title) => features.find((f) => f.title === title))
    .filter((f): f is (typeof features)[number] => Boolean(f));
}

export function PlacementOutcomesSection() {
  const items = pickPlacement();

  return (
    <section
      aria-labelledby="placement-heading"
      className="relative border-b border-border/80 bg-background"
    >
      <div className="py-14 sm:py-16 lg:py-20">
        <SectionContainer>
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="placement-heading"
              className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-[2rem] md:leading-tight"
            >
              Placement / Outcomes
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
              <span className="font-semibold tabular-nums text-foreground">{stats[2].value}</span>{" "}
              {stats[2].label}
            </p>
          </div>
          <ul className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2">
            {items.map((feature) => (
              <li key={feature.title}>
                <Card className="h-full rounded-xl border-border/80 bg-muted/30 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/15 hover:shadow-md">
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
