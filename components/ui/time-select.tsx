/**
 * shadcn‑style time dropdown (15‑minute increments)
 */
"use client";

import * as React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { isNextDay } from "@/lib/parsers/time";

/* ------------------------------------------------------------------ */
/*  create “12:00 AM”, “12:15 AM”, …                                   */
/* ------------------------------------------------------------------ */
const OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 15) {
    const hour12 = ((h + 11) % 12) + 1;
    const suffix = h < 12 ? "AM" : "PM";
    OPTIONS.push(
      `${hour12.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")} ${suffix}`
    );
  }
}

/* ------------------------------------------------------------------ */
/*  component                                                         */
/* ------------------------------------------------------------------ */
interface TimeSelectProps {
  label: React.ReactNode; // change from string to React.ReactNode
  value: string;
  onChange: (v: string) => void;
  className?: string;
  startTime?: string;
  isEndTime?: boolean;
  "aria-label"?: string;
}

export function TimeSelect({
  label,
  value,
  onChange,
  className,
  startTime,
  isEndTime = false,
  "aria-label": ariaLabel,
}: TimeSelectProps) {
  const getOrderedOptions = () => {
    if (!isEndTime || !startTime) {
      return OPTIONS;
    }

    const currentDayOptions: string[] = [];
    const nextDayOptions: string[] = [];

    OPTIONS.forEach((time) => {
      if (isNextDay(startTime, time)) {
        nextDayOptions.push(time);
      } else {
        currentDayOptions.push(time);
      }
    });

    return [...currentDayOptions, ...nextDayOptions];
  };

  const orderedOptions = getOrderedOptions();

  return (
    <div className={className}>
      <p className="mb-1 text-sm font-medium">{label}</p>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-10 w-[140px]" aria-label={ariaLabel}>
          <SelectValue placeholder="--:--" />
        </SelectTrigger>

        <SelectContent className="max-h-60">
          {orderedOptions.map((t) => {
            const showNextDay =
              isEndTime && startTime && isNextDay(startTime, t);
            return (
              <SelectItem key={t} value={t}>
                <span className="flex items-center gap-1">
                  {t}
                  {showNextDay && (
                    <span className="text-xs text-gray-500 font-medium">
                      +1
                    </span>
                  )}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
