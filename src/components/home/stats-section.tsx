import { SectionContainer } from "@/components/layout/section-container";
import { stats } from "@/lib/home-data";

export function StatsSection() {
  return (
    <section className="bg-gradient-to-br from-zinc-50 via-indigo-50/60 to-purple-50/60 py-12 sm:py-14 lg:py-16">
      <SectionContainer className="relative">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition hover:shadow-md"
            >
              <p className="text-3xl font-bold leading-none tracking-tight text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
                {item.value}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
