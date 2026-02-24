import { NextResponse } from "next/server";

import { DateTime } from "luxon";

import { findFilteredRides } from "@/lib/db";
import { ApiError, withApiErrorHandler } from "@/lib/infra";
import { createStartEndDateTimes, decodeDate } from "@/lib/parsers";
import { filterRidesByTimeWindow } from "./_timeFilter";

const TIME_ZONE = "America/New_York";

/**
 * Handles GET requests to search for filtered rides.
 * Filters rides based on location, date, and time window criteria.
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
  const dateObject = dateRaw ? decodeDate(dateRaw) : null;
  const hasDate = !!dateObject;

  // Smart defaults for partial time input
  const effectiveStartTime = hasStart ? startTime : "12:00 AM";
  const effectiveEndTime = hasEnd ? endTime : "11:59 PM";
  const hasTimeWindow = hasStart || hasEnd;

  const noFilters = !hasFrom && !hasTo && !hasDate && !hasTimeWindow;
  if (noFilters) {
    throw new ApiError("At least one search filter is required", 400);
  }

  /*
   * Time filtering strategy based on two dimensions:
   * - hasTimeWindow: user specified start/end time (with smart defaults)
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
        effectiveStartTime,
        effectiveEndTime,
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

  // Stage 1: DB-level coarse filter (location + datetime range if date provided)
  const ridesData = await findFilteredRides(from, to, filterStartTime, filterEndTime);
  let rides: unknown[] = ridesData;

  // Stage 2: in-memory time-of-day filter, only when time window is given without a date
  // (SQL can't easily express "between 2PM and 4PM across all dates")
  if (needsInMemoryTimeFilter) {
    rides = filterRidesByTimeWindow(rides, effectiveStartTime, effectiveEndTime);
  }

  return NextResponse.json(rides);
}

export const GET = withApiErrorHandler(getHandler);
