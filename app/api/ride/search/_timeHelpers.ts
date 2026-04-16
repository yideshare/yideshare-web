import { DateTime } from "luxon";

import { TIME_ZONE } from "@/lib/const";

const MINUTES_IN_DAY = 1440;

/**
 * Converts a date to minutes since midnight in the specified timezone.
 */
export function dateToMinutesSinceMidnight(dt: Date): number {
  const d = DateTime.fromJSDate(dt).setZone(TIME_ZONE);
  return d.hour * 60 + d.minute;
}

export function timeStringToMinutesSinceMidnight(timeStr: string): number {
  const dt = DateTime.fromFormat(timeStr, "h:mm a", { zone: TIME_ZONE });
  return dt.hour * 60 + dt.minute;
}

/**
 * Splits a time range into at most two non-wrapping intervals.
 *
 * Most ranges are simple: e.g. [9:00, 17:00] becomes [[540, 1020]]
 *
 * When a range crosses midnight (e.g. 11:00 PM to 1:00 AM), it wraps around
 * and must be split into two intervals: [[1380, 1440], [0, 60]]
 */
export function splitAtMidnight(
  start: number,
  end: number
): Array<[number, number]> {
  if (end > start) return [[start, end]];
  return [
    [start, MINUTES_IN_DAY],
    [0, end],
  ];
}

export function intervalsOverlap(
  a: Array<[number, number]>,
  b: Array<[number, number]>
): boolean {
  return a.some(([aStart, aEnd]) =>
    b.some(([bStart, bEnd]) => Math.min(aEnd, bEnd) > Math.max(aStart, bStart))
  );
}
