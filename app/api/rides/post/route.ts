import { NextResponse } from "next/server";

import { createRide, getUserFromCookies } from "@/lib/db";
import { ApiError, withApiErrorHandler } from "@/lib/infra";

/**
 * Handles POST requests to create a new ride.
 * Validates user authentication and ride data before creation.
 */
async function postHandler(request: Request): Promise<NextResponse> {
  const { user } = await getUserFromCookies();

  if (!user) {
    throw new ApiError("User not found or not authenticated", 401);
  }

  const ride = await request.json();
  const beginning = ride.beginning ?? ride.departure;

  if (!beginning || !ride.destination) {
    throw new ApiError("Beginning and destination are required", 400);
  }

  const newRide = await createRide({ ...ride, beginning }, user);

  return NextResponse.json(
    { message: "Ride created successfully", ride: newRide },
    { status: 200 },
  );
}

export const POST = withApiErrorHandler(postHandler);
