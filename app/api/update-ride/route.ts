import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserNetIdFromCookies } from "@/lib/user";
import { withApiErrorHandler, ApiError } from "@/lib/withApiErrorHandler";

async function deleteHandler(request: Request) {
  const url = new URL(request.url);
  const rideId = url.searchParams.get("rideId");
  if (!rideId) throw new ApiError("rideId is required", 400);

  const netId = await getUserNetIdFromCookies();
  if (!netId) throw new ApiError("Unauthorized", 401);

  const ride = await prisma.ride.findUnique({ where: { rideId } });
  if (!ride) throw new ApiError("Ride not found", 404);

  if (ride.ownerNetId !== netId)
    throw new ApiError("Unauthorized to delete this ride", 403);

  await prisma.bookmark.deleteMany({ where: { rideId: ride.rideId } });
  await prisma.ride.delete({ where: { rideId: ride.rideId } });

  return NextResponse.json(
    { message: "Ride deleted successfully" },
    { status: 200 }
  );
}

async function patchHandler(request: Request) {
  const url = new URL(request.url);
  const rideId = url.searchParams.get("rideId");
  if (!rideId) throw new ApiError("rideId is required", 400);

  const netId = await getUserNetIdFromCookies();
  if (!netId) throw new ApiError("Unauthorized", 401);

  const existingRide = await prisma.ride.findUnique({ where: { rideId } });
  if (!existingRide) throw new ApiError("Ride not found", 404);

  if (existingRide.ownerNetId !== netId)
    throw new ApiError("Unauthorized to edit this ride", 403);

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
