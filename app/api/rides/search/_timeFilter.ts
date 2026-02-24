import { DateTime } from "luxon";

const MINUTES_IN_DAY = 1440;
const TIME_ZONE = "America/New_York";

/**
 * Converts a date to minutes since midnight in the specified timezone.
 */
function toMinutes(dt: Date): number {
  const d = DateTime.fromJSDate(dt).setZone(TIME_ZONE);
  return d.hour * 60 + d.minute;
}

/**
 * Parses a time string (e.g., "2:30 PM") to minutes since midnight.
 */
function parseTimeToMinutes(timeStr: string): number {
  const dt = DateTime.fromFormat(timeStr, "h:mm a", { zone: TIME_ZONE });
  return dt.hour * 60 + dt.minute;
}

/**
 * Returns 1 or 2 non-wrapping intervals within [0,1440).
 * Handles midnight boundary cases for time ranges.
 */
function splitInterval(start: number, end: number): Array<[number, number]> {
  if (end > start) return [[start, end]];
  return [
    [start, MINUTES_IN_DAY],
    [0, end],
  ];
}

function intervalsOverlap(
  intervalA: Array<[number, number]>,
  intervalB: Array<[number, number]>,
): boolean {
  // The `.some()` method checks each pair of elements in an array
  return intervalA.some(([aStart, aEnd]) => {
    return intervalB.some(([bStart, bEnd]) => {
      return Math.min(aEnd, bEnd) > Math.max(aStart, bStart);
    });
  });
}

/**
 * Filters rides based on a time window, checking all days if no specific date.
 */
export function filterRidesByTimeWindow(
  rides: unknown[],
  startTimeStr: string,
  endTimeStr: string,
): unknown[] {
  const reqStartMin = parseTimeToMinutes(startTimeStr);
  const reqEndMin = parseTimeToMinutes(endTimeStr);
  const isSinglePoint = reqStartMin === reqEndMin;

  return rides.filter((ride: unknown) => {
    if (typeof ride !== "object" || ride === null) return false;
    const rideObj = ride as Record<string, unknown>;

    const rs = toMinutes(rideObj.startTime as Date);
    const re = toMinutes(rideObj.endTime as Date);

    if (isSinglePoint) {
      // Single point in time
      if (re > rs) {
        return reqStartMin >= rs && reqStartMin <= re;
      }
      return reqStartMin >= rs || reqStartMin <= re;
    } else {
      // Time range - check for overlap
      const reqSegs = splitInterval(reqStartMin, reqEndMin);
      const rideSegs = splitInterval(rs, re);
      return intervalsOverlap(reqSegs, rideSegs);
    }
  });
}
