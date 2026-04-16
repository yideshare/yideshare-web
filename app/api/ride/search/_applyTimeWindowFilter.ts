import type { Ride } from "@/prisma/generated/prisma/client";

import {
  dateToMinutesSinceMidnight,
  timeStringToMinutesSinceMidnight,
  splitAtMidnight,
  intervalsOverlap,
} from "./_timeHelpers";

/**
 * @internal
 * @private Only for use within /api/rides/search route.
 *
 * Filters rides to those whose time window overlaps the requested time range.
 * Used when a user specifies a time-of-day range but no specific date,
 * so we check overlap across all dates in memory rather than at the DB level.
 * This will get slow when the number of rides >= 5000
 */
export function applyTimeWindowFilter(
  rides: Ride[],
  startTime: string,
  endTime: string
): Ride[] {
  const reqStart = timeStringToMinutesSinceMidnight(startTime);
  const reqEnd = timeStringToMinutesSinceMidnight(endTime);

  return rides.filter((ride) => {
    if (!ride) {
      return false;
    }

    const { startTime, endTime } = ride;
    const rideStart = dateToMinutesSinceMidnight(startTime);
    const rideEnd = dateToMinutesSinceMidnight(endTime);

    // Single point: user wants rides active at one exact minute
    if (reqStart === reqEnd) {
      const rideSpans = splitAtMidnight(rideStart, rideEnd);
      return rideSpans.some(([s, e]) => reqStart >= s && reqStart <= e);
    }

    return intervalsOverlap(
      splitAtMidnight(reqStart, reqEnd),
      splitAtMidnight(rideStart, rideEnd)
    );
  });
}
