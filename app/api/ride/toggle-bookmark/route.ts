import { NextResponse } from "next/server";

import { withApiErrorHandler, ApiError } from "@/lib/apiErrorHandler";
import { getUserNetIdFromCookies } from "@/lib/cookies";

import { bookmarkRide } from "./_bookmarkRide";

/**
 * Handles POST requests to toggle bookmark on a ride.
 */
async function handleToggleBookmark(req: Request): Promise<NextResponse> {
  const netId = await getUserNetIdFromCookies();
  const rideId = await extractRideIdFromRequest(req);

  if (netId === null) {
    throw new ApiError("Bookmark: Cannot get user netId from cookies", 401);
  }

  if (rideId === null) {
    throw new ApiError(
      "Bookmark: Request payload does not contain rideId",
      400
    );
  }

  // Toggle the bookmark
  const isBookmarkActive = await bookmarkRide(netId, rideId);
  return NextResponse.json({ bookmarked: isBookmarkActive });
}

export const POST = withApiErrorHandler(handleToggleBookmark);

async function extractRideIdFromRequest(req: Request): Promise<string | null> {
  const body = await req.json();
  return body.rideId ? body.rideId : null;
}
