import { CheckCircle2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export type BookingSuccessBannerProps = {
  dateLabel: string;
  slotLabel: string;
};

export function BookingSuccessBanner({ dateLabel, slotLabel }: BookingSuccessBannerProps) {
  return (
    <Card className="border-emerald-500/30 bg-emerald-500/[0.07] shadow-sm ring-1 ring-emerald-500/20">
      <CardContent className="flex items-start gap-3 pt-6">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
        <div>
          <p className="font-semibold text-emerald-900 dark:text-emerald-100">Booking confirmed</p>
          <p className="mt-1 text-sm text-emerald-800/90 dark:text-emerald-200/90">
            Your session is scheduled for{" "}
            <span className="font-medium">{dateLabel}</span> at{" "}
            <span className="font-medium">{slotLabel}</span>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
