export type CourseCardProps = {
  title: string;
  price: string;
  rating: number;
  lessons: number;
};

/**
 * Reusable program card for AI / data courses.
 */
export function CourseCard({ title, price, rating, lessons }: CourseCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold leading-snug text-slate-900">{title}</h3>
        <span className="shrink-0 rounded-lg bg-indigo-50 px-2.5 py-1 text-sm font-bold text-indigo-700">
          {price}
        </span>
      </div>
      <dl className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Rating</dt>
          <dd className="flex items-center gap-1 font-medium text-slate-800">
            <span className="text-amber-500" aria-hidden>
              ★
            </span>
            {rating.toFixed(1)}
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Lessons</dt>
          <dd>
            <span className="font-semibold text-slate-800">{lessons}</span> lessons
          </dd>
        </div>
      </dl>
      <div className="mt-auto pt-6">
        <a
          href="#"
          className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-white"
        >
          View program
        </a>
      </div>
    </article>
  );
}
