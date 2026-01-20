import { NextResponse } from "next/server";
import { createRide } from "@/lib/ride";
import { getUserNetIdFromCookies } from "@/lib/user";
import { withApiErrorHandler, ApiError } from "@/lib/withApiErrorHandler";

async function postHandler(request: Request) {
  const netId = await getUserNetIdFromCookies();

  if (netId === null) {
    throw new ApiError("Cannot get user netId from cookies", 401);
  }

  const ride = await request.json();
  const newRide = await createRide(ride, netId);

  return NextResponse.json(
    { message: "Ride created successfully", ride: newRide },
    { status: 200 }
  );
}

export const POST = withApiErrorHandler(postHandler);
