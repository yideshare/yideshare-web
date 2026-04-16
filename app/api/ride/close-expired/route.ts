import { NextResponse } from "next/server";

import { ApiError, withApiErrorHandler } from "@/lib/apiErrorHandler";

import { closeExpiredRides } from "./_closeExpiredRides";

/**
 * Handles GET requests to close all expired rides.
 * A ride is considered expired if it ended in the past.
 */
async function handleClosedExpiredRides(request: Request): Promise<NextResponse> {
  // Request header should include an authorization secret
  const authHeader = request.headers.get("authorization") ?? undefined;
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    throw new ApiError("Close Rides: CRON_SECRET missing from .env file");
  }
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    throw new ApiError("Close Rides: Unauthorized access attempt", 401);
  }

  // Proceed with the cron job
  const result = await closeExpiredRides();
  return NextResponse.json({ success: true, ...result });
}

export const GET = withApiErrorHandler(handleClosedExpiredRides);
