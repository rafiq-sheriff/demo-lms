import { stats } from "@/lib/home-data";

export function StatsSection() {
  return (
    <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-16 text-white sm:py-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="text-center sm:text-left">
              <p className="text-4xl font-bold tracking-tight sm:text-5xl">{item.value}</p>
              <p className="mt-3 text-sm font-medium leading-relaxed text-indigo-100/90">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
