import { NextResponse } from "next/server";

import { DateTime } from "luxon";

import { findFilteredRides } from "@/lib/db";
import { withApiErrorHandler } from "@/lib/infra";
import { createStartEndDateTimes, decodeDate } from "@/lib/parsers";

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

/**
 * Checks if two interval arrays overlap.
 */
function intervalsOverlap(
  a: Array<[number, number]>,
  b: Array<[number, number]>,
): boolean {
  return a.some(([as, ae]) =>
    b.some(([bs, be]) => Math.min(ae, be) > Math.max(as, bs)),
  );
}

/**
 * Filters rides based on a time window, checking all days if no specific date.
 */
function filterRidesByTimeWindow(
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

/**
 * Handles GET requests to search for filtered rides.
 * Filters rides based on location, date, and time window criteria.
 *
 * @param request - The HTTP request containing search parameters
 * @returns JSON array of matched rides based on search criteria
 * @throws Error if search parameters are invalid
 */
async function getHandler(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const from = (searchParams.get("from") || "").trim();
  const to = (searchParams.get("to") || "").trim();
  const dateRaw = searchParams.get("date");
  const startTime = (searchParams.get("startTime") || "").trim();
  const endTime = (searchParams.get("endTime") || "").trim();

  const hasFrom = from.length > 0;
  const hasTo = to.length > 0;
  const hasStart = startTime.length > 0;
  const hasEnd = endTime.length > 0;
  const hasTimeWindow = hasStart && hasEnd;
  const dateObject = dateRaw ? decodeDate(dateRaw) : null;
  const hasDate = !!dateObject;

  const noFilters = !hasFrom && !hasTo && !hasDate && !hasTimeWindow;
  if (noFilters) {
    return NextResponse.json([]);
  }

  /*
   * Time filtering strategy based on two dimensions:
   * - hasTimeWindow: user specified both start and end time
   * - hasDate: user selected a specific date
   */
  let filterStartTime: Date | null = null;
  let filterEndTime: Date | null = null;
  let needsInMemoryTimeFilter = false;

  if (hasTimeWindow) {
    if (hasDate && dateObject) {
      // Time window + date: filter by exact datetime range at DB level
      const { startTimeObject, endTimeObject } = createStartEndDateTimes(
        dateObject,
        startTime,
        endTime,
      );
      filterStartTime = startTimeObject;
      filterEndTime = endTimeObject;
    } else {
      // Time window + no date: filter by time-of-day across all dates in memory
      needsInMemoryTimeFilter = true;
    }
  } else {
    if (hasDate && dateObject) {
      // No time window + date: search the full day
      filterStartTime = DateTime.fromJSDate(dateObject)
        .setZone(TIME_ZONE)
        .startOf("day")
        .toJSDate();
      filterEndTime = DateTime.fromJSDate(dateObject)
        .setZone(TIME_ZONE)
        .endOf("day")
        .toJSDate();
    }
    // No time window + no date: no time filtering, only location filter
  }

  const ridesData = await findFilteredRides(from, to, filterStartTime, filterEndTime);
  let rides: unknown[] = ridesData;

  if (needsInMemoryTimeFilter) {
    rides = filterRidesByTimeWindow(rides, startTime, endTime);
  }

  return NextResponse.json(rides);
}

export const GET = withApiErrorHandler(getHandler);
