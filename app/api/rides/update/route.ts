import { NextResponse } from "next/server";
import { Ride } from "@prisma/client";
import { prisma, getUserNetIdFromCookies } from "@/lib/db";
import { withApiErrorHandler, ApiError } from "@/lib/infra";

/**
 * Validates ride ownership by checking auth, ride existence, and ownership.
 */
async function validateRideOwnership(
  request: Request,
  action: string,
): Promise<Ride> {
  const url = new URL(request.url);
  const rideId = url.searchParams.get("rideId");
  if (!rideId) throw new ApiError("rideId is required", 400);

  const netId = await getUserNetIdFromCookies();
  if (!netId) throw new ApiError("Unauthorized", 401);

  const ride = await prisma.ride.findUnique({ where: { rideId } });
  if (!ride) throw new ApiError("Ride not found", 404);

  if (ride.ownerNetId !== netId)
    throw new ApiError(`Unauthorized to ${action} this ride`, 403);

  return ride;
}

/**
 * Handles DELETE requests to remove a ride.
 */
async function deleteHandler(request: Request): Promise<NextResponse> {
  const ride = await validateRideOwnership(request, "delete");

  await prisma.bookmark.deleteMany({ where: { rideId: ride.rideId } });
  await prisma.ride.delete({ where: { rideId: ride.rideId } });

  return NextResponse.json(
    { message: "Ride deleted successfully" },
    { status: 200 },
  );
}

/**
 * Handles PATCH requests to update ride details.
 *
 * @param request - The HTTP request containing rideId as query param and updated data in body
 * @returns JSON with the updated ride data
 * @throws ApiError if unauthorized or ride not found
 */
async function patchHandler(request: Request): Promise<NextResponse> {
  const existingRide = await validateRideOwnership(request, "edit");
  const updatedRideData = await request.json();

  const updatedRide = await prisma.ride.update({
    where: { rideId: existingRide.rideId },
    data: {
      beginning: updatedRideData.beginning,
      destination: updatedRideData.destination,
      description: updatedRideData.description,
      startTime: updatedRideData.startTime
        ? new Date(updatedRideData.startTime)
        : undefined,
      endTime: updatedRideData.endTime
        ? new Date(updatedRideData.endTime)
        : undefined,
      totalSeats: updatedRideData.totalSeats,
      ownerName: updatedRideData.ownerName,
      ownerPhone: updatedRideData.ownerPhone,
      hasCar: updatedRideData.hasCar,
    },
  });

  return NextResponse.json(updatedRide);
}

export const DELETE = withApiErrorHandler(deleteHandler);
export const PATCH = withApiErrorHandler(patchHandler);
