import { NextResponse } from "next/server";

import { getUserFromCookies } from "@/lib/cookies";
import { ApiError, withApiErrorHandler } from "@/lib/apiErrorHandler";

import { createRide } from "./_createRide";

/**
 * Handles POST requests to create a new ride.
 * Validates user authentication and ride data before creation.
 */
async function handlePostRide(request: Request): Promise<NextResponse> {
  const user = await getUserFromCookies();

  if (!user) {
    throw new ApiError("Post Ride: User not found", 401);
  }

  const ride = await request.json();
  const beginning = ride.beginning ?? ride.departure;

  if (!beginning || !ride.destination) {
    throw new ApiError("Post Ride: Beginning and destination are required", 400);
  }

  const newRide = await createRide({ ...ride, beginning }, user);

  return NextResponse.json(
    { message: "Ride created successfully", ride: newRide },
    { status: 200 },
  );
}

export const POST = withApiErrorHandler(handlePostRide);
