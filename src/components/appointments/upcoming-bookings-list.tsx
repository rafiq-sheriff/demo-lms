import { Calendar, Clock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
export type BookingDisplay = {
  id: string;
  dateLabel: string;
  slotLabel: string;
  status: "upcoming" | "completed";
};

function StatusBadge({ status }: { status: BookingDisplay["status"] }) {
  const upcoming = status === "upcoming";
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
        upcoming
          ? "bg-primary/12 text-primary ring-1 ring-primary/20"
          : "bg-muted text-muted-foreground ring-1 ring-border/80"
      )}
    >
      {upcoming ? "Upcoming" : "Completed"}
    </span>
  );
}

export type UpcomingBookingsListProps = {
  bookings: BookingDisplay[];
};

export function UpcomingBookingsList({ bookings }: UpcomingBookingsListProps) {
  if (bookings.length === 0) {
    return (
      <Card className="rounded-xl border-dashed border-border/80 bg-muted/20 shadow-sm">
        <CardContent className="py-12 text-center">
          <p className="text-sm font-medium text-foreground">No bookings yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a date and time above to schedule your next session.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <Card
          key={b.id}
          className="rounded-xl border-border/80 bg-card shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-foreground">Mentor session</p>
                <StatusBadge status={b.status} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {b.dateLabel}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {b.slotLabel}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function UpcomingBookingsSection({ bookings }: UpcomingBookingsListProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Upcoming &amp; past</h2>
      <UpcomingBookingsList bookings={bookings} />
    </section>
  );
}
