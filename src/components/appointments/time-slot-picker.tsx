"use client";

import { cn } from "@/lib/utils";

export type SlotOption = { id: string; label: string };

export type TimeSlotPickerProps = {
  slots: SlotOption[];
  selectedSlotId: string | null;
  onSelect: (slotId: string) => void;
  disabled?: boolean;
};

export function TimeSlotPicker({ slots, selectedSlotId, onSelect, disabled }: TimeSlotPickerProps) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-foreground">Select a time</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {slots.map((slot) => {
          const selected = slot.id === selectedSlotId;
          return (
            <button
              key={slot.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(slot.id)}
              className={cn(
                "min-h-11 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200",
                disabled && "cursor-not-allowed opacity-50",
                selected
                  ? "border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/25"
                  : "border-border/80 bg-card text-foreground shadow-sm hover:scale-[1.02] hover:border-primary/35 hover:shadow-md active:scale-[0.99]"
              )}
            >
              {slot.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
