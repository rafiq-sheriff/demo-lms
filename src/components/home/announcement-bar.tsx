export function AnnouncementBar() {
  return (
    <div className="relative border-b border-white/10 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 px-4 py-2 text-center">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_100%_at_50%_-20%,rgb(99_102_241/0.25),transparent_55%)]"
        aria-hidden
      />
      <p className="relative text-[13px] font-medium leading-snug tracking-wide text-zinc-100 sm:text-sm">
        Book a 1:1 consultation to setup your portfolio for upcoming drives
      </p>
    </div>
  );
}
