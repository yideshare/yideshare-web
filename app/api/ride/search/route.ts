import { NextResponse } from "next/server";

import { createStartEndDateTimes } from "@/lib/time";
import { withApiErrorHandler } from "@/lib/apiErrorHandler";

import { findFilteredRides } from "./_findFilteredRides";
import { applyTimeWindowFilter } from "./_applyTimeWindowFilter";

/**
 * Handles GET requests to search for filtered rides.
 * Filters rides based on location, date, and time window criteria.
 */
async function getHandler(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const from = searchParams.get("from") ?? null;
  const to = searchParams.get("to") ?? null;
  const startTime = searchParams.get("startTime") ?? null;
  const endTime = searchParams.get("endTime") ?? null;
  const dateParam = searchParams.get("date") ?? null;
  const dateObject = dateParam ? new Date(dateParam) : null;

  // Smart defaults for partial time input
  const effectiveStartTime = startTime || "12:00 AM";
  const effectiveEndTime = endTime || "11:59 PM";

  let rides = null;

  // Date provided
  if (dateObject) {
    // Build time interval
    const { startTimeObject, endTimeObject } = createStartEndDateTimes(
      dateObject,
      effectiveStartTime,
      effectiveEndTime
    );

    rides = await findFilteredRides(from, to, startTimeObject, endTimeObject);
    // No date provided
  } else {
    rides = await findFilteredRides(from, to, null, null);

    // Apply in-memory filter if time provided
    if (startTime || endTime) {
      rides = applyTimeWindowFilter(
        rides,
        effectiveStartTime,
        effectiveEndTime
      );
    }
  }

  return NextResponse.json(rides);
}

export const GET = withApiErrorHandler(getHandler);
