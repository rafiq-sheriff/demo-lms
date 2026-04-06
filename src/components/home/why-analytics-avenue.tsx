import { whyAnalyticsAvenue } from "@/lib/home-data";

export function WhyAnalyticsAvenue() {
  return (
    <section className="border-b border-slate-200/80 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {whyAnalyticsAvenue.heading}
          </h2>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-slate-600">
            {whyAnalyticsAvenue.body}
          </p>
        </div>
      </div>
    </section>
  );
}
