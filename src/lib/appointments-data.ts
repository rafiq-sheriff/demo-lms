/** Time slots shown in the booking UI (labels only — no content change). */
export const BOOKING_TIME_SLOTS: { id: string; label: string }[] = [
  { id: "t09", label: "9:00 AM" },
  { id: "t10", label: "10:00 AM" },
  { id: "t11", label: "11:00 AM" },
  { id: "t13", label: "1:00 PM" },
  { id: "t14", label: "2:00 PM" },
  { id: "t15", label: "3:00 PM" },
  { id: "t16", label: "4:00 PM" },
];

export type BookingRecordStatus = "upcoming" | "completed";

export type BookingRecord = {
  id: string;
  /** YYYY-MM-DD */
  dateKey: string;
  /** Display label for date */
  dateLabel: string;
  slotId: string;
  slotLabel: string;
  status: BookingRecordStatus;
};

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateLabel(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** Next N calendar days starting from today (local). */
export function getSelectableDates(count = 14): { key: string; label: string; dayNum: string; weekday: string }[] {
  const out: { key: string; label: string; dayNum: string; weekday: string }[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push({
      key: formatDateKey(d),
      label: formatDateLabel(d),
      dayNum: String(d.getDate()),
      weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
    });
  }
  return out;
}

export const initialUpcomingBookings: BookingRecord[] = [
  {
    id: "b0",
    dateKey: "2026-04-10",
    dateLabel: "Thu, Apr 10",
    slotId: "t14",
    slotLabel: "2:00 PM",
    status: "upcoming",
  },
  {
    id: "b-past",
    dateKey: "2026-03-20",
    dateLabel: "Thu, Mar 20",
    slotId: "t11",
    slotLabel: "11:00 AM",
    status: "completed",
  },
];
