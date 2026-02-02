import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createRide, getUserFromCookies, getUserNetIdFromCookies } from "@/lib/db";
import { ApiError, withApiErrorHandler } from "@/lib/infra";

/**
 * Handles POST requests to create a new ride.
 * Validates user authentication and ride data before creation.
 *
 * @param request - The HTTP request containing ride data
 * @returns JSON response with created ride data
 * @throws ApiError if user is not authenticated or ride creation fails
 */
async function postHandler(request: Request): Promise<NextResponse> {
  const netId = await getUserNetIdFromCookies();
  const cookieStore = await cookies();
  const { user } = await getUserFromCookies(cookieStore);

  if (netId === null) {
    throw new ApiError("Cannot get user netId from cookies", 401);
  }

  if (!user) {
    throw new ApiError("User not found", 401);
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
