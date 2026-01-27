import { NextResponse } from "next/server";
import { createRide } from "@/lib/ride";
import { cookies } from "next/headers";
import { getUserFromCookies, getUserNetIdFromCookies } from "@/lib/user";
import { withApiErrorHandler, ApiError } from "@/lib/withApiErrorHandler";

async function postHandler(request: Request) {
  const netId = await getUserNetIdFromCookies();
  const cookieStore = await cookies();
  const {user, error, status} = await getUserFromCookies(cookieStore);

  if (netId === null) {
    throw new ApiError("Cannot get user netId from cookies", 401);
  }

  const ride = await request.json();
  const newRide = await createRide(ride, user);

  return NextResponse.json(
    { message: "Ride created successfully", ride: newRide },
    { status: 200 }
  );
}

export const POST = withApiErrorHandler(postHandler);
