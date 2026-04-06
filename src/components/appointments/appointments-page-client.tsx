"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { AppointmentDateStrip } from "@/components/appointments/appointment-date-strip";
import { BookingSuccessBanner } from "@/components/appointments/booking-success-banner";
import { TimeSlotPicker } from "@/components/appointments/time-slot-picker";
import {
  type BookingDisplay,
  UpcomingBookingsSection,
} from "@/components/appointments/upcoming-bookings-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ApiError,
  bookAppointment,
  getTimeSlots,
  listBookings,
  type BookingOut,
  type TimeSlotOut,
} from "@/lib/api";

function formatRange(startIso: string, endIso: string): string {
  const s = new Date(startIso);
  const e = new Date(endIso);
  return `${s.toLocaleTimeString(undefined, { timeStyle: "short" })} – ${e.toLocaleTimeString(undefined, { timeStyle: "short" })}`;
}

function buildDateStrip(slots: TimeSlotOut[]) {
  const map = new Map<string, Date>();
  for (const slot of slots) {
    const d = new Date(slot.start_at);
    const key = d.toDateString();
    if (!map.has(key)) map.set(key, d);
  }
  const sorted = [...map.entries()].sort((a, b) => a[1].getTime() - b[1].getTime());
  return sorted.map(([key, d]) => ({
    key,
    label: d.toLocaleDateString(undefined, { dateStyle: "medium" }),
    dayNum: String(d.getDate()),
    weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
  }));
}

function mapBookingList(
  bookings: BookingOut[],
  slots: TimeSlotOut[],
): BookingDisplay[] {
  const slotById = new Map(slots.map((s) => [s.id, s]));
  return bookings.map((b) => {
    const slot = slotById.get(b.time_slot_id);
    const anchor = slot ? new Date(slot.start_at) : new Date(b.created_at);
    return {
      id: b.id,
      dateLabel: anchor.toLocaleDateString(undefined, { dateStyle: "medium" }),
      slotLabel: slot ? formatRange(slot.start_at, slot.end_at) : "Session",
      status: b.status === "completed" ? "completed" : "upcoming",
    };
  });
}

export function AppointmentsPageClient() {
  const qc = useQueryClient();
  const slotsQuery = useQuery({ queryKey: ["time-slots"], queryFn: getTimeSlots });
  const bookingsQuery = useQuery({ queryKey: ["bookings"], queryFn: listBookings });

  const dates = useMemo(() => buildDateStrip(slotsQuery.data ?? []), [slotsQuery.data]);
  const [userDateKey, setUserDateKey] = useState<string | null>(null);
  const selectedDateKey = userDateKey ?? dates[0]?.key ?? null;
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [lastSuccess, setLastSuccess] = useState<{ dateLabel: string; slotLabel: string } | null>(
    null,
  );

  const selectedDateLabel = useMemo(() => {
    if (!selectedDateKey) return "";
    return dates.find((d) => d.key === selectedDateKey)?.label ?? "";
  }, [dates, selectedDateKey]);

  const slotsForDay = useMemo(() => {
    if (!selectedDateKey || !slotsQuery.data) return [];
    return slotsQuery.data.filter((s) => new Date(s.start_at).toDateString() === selectedDateKey);
  }, [selectedDateKey, slotsQuery.data]);

  const slotOptions = useMemo(
    () =>
      slotsForDay.map((s) => ({
        id: s.id,
        label: formatRange(s.start_at, s.end_at),
      })),
    [slotsForDay],
  );

  const bookingRecords = useMemo(
    () => mapBookingList(bookingsQuery.data ?? [], slotsQuery.data ?? []),
    [bookingsQuery.data, slotsQuery.data],
  );

  const bookMut = useMutation({
    mutationFn: (time_slot_id: string) => bookAppointment({ time_slot_id }),
    onSuccess: async (_, time_slot_id) => {
      await qc.invalidateQueries({ queryKey: ["bookings"] });
      const slot = slotsQuery.data?.find((s) => s.id === time_slot_id);
      const dateLabel = slot
        ? new Date(slot.start_at).toLocaleDateString(undefined, { dateStyle: "medium" })
        : selectedDateLabel;
      const slotLabel = slot ? formatRange(slot.start_at, slot.end_at) : "";
      setLastSuccess({ dateLabel, slotLabel });
      setSelectedSlotId(null);
      toast.success("Booking confirmed");
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.detail : "Could not book"),
  });

  const handleConfirm = useCallback(() => {
    if (!selectedSlotId) return;
    bookMut.mutate(selectedSlotId);
  }, [bookMut, selectedSlotId]);

  if (slotsQuery.isLoading || bookingsQuery.isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="h-10 w-56 animate-pulse rounded-lg bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (slotsQuery.isError) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-dashed border-destructive/40 bg-destructive/5 px-6 py-10 text-center">
        <p className="font-medium text-foreground">Could not load time slots</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {slotsQuery.error instanceof ApiError ? slotsQuery.error.detail : "Check the API and try again."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header className="space-y-1">
        <h1 className="lms-page-title">Appointments</h1>
        <p className="lms-page-lead mt-1">
          Book a 1:1 session with a mentor. Choose a slot that fits your schedule.
        </p>
      </header>

      {lastSuccess ? (
        <BookingSuccessBanner dateLabel={lastSuccess.dateLabel} slotLabel={lastSuccess.slotLabel} />
      ) : null}

      <Card className="rounded-xl border-border/80 shadow-sm transition-shadow duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Book a session</CardTitle>
          <CardDescription>Select a date and time slot to reserve your appointment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {dates.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No mentor slots are available yet. Check back soon or ask an admin to add time slots.
            </p>
          ) : (
            <>
              <AppointmentDateStrip
                dates={dates}
                selectedKey={selectedDateKey}
                onSelect={(key) => {
                  setUserDateKey(key);
                  setSelectedSlotId(null);
                }}
              />

              <TimeSlotPicker
                slots={slotOptions}
                selectedSlotId={selectedSlotId}
                onSelect={setSelectedSlotId}
                disabled={!selectedDateKey}
              />

              <div className="flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {selectedDateKey && selectedSlotId ? (
                    <>
                      Selected:{" "}
                      <span className="font-medium text-foreground">{selectedDateLabel}</span>
                      {" · "}
                      <span className="font-medium text-foreground">
                        {slotOptions.find((s) => s.id === selectedSlotId)?.label}
                      </span>
                    </>
                  ) : (
                    "Choose a date and time to continue."
                  )}
                </p>
                <Button
                  type="button"
                  className="rounded-xl shadow-sm transition hover:shadow-md"
                  disabled={!selectedDateKey || !selectedSlotId || bookMut.isPending}
                  onClick={handleConfirm}
                >
                  {bookMut.isPending ? "Booking…" : "Confirm booking"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <UpcomingBookingsSection bookings={bookingRecords} />
    </div>
  );
}
