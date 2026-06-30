import { prisma } from "@/lib/db";

import type { Ride } from "@/prisma/generated/prisma/client";

const DEFAULT_TAKEN_SEATS_FOR_CREATOR = 1;
const DEFAULT_TOTAL_SEATS = 4;

/**
 * @internal
 * @private Only for use within /api/ride/post route.
 */
export async function createRide(
  ride: Ride,
  user: { netId: string; name: string; email: string },
): Promise<Ride> {
  const newRide = await prisma.ride.create({
    data: {
      ownerNetId: user.netId,
      ownerName: user.name,
      ownerEmail: user.email,
      ownerPhone: ride.ownerPhone || "",
      beginning: ride.beginning,
      destination: ride.destination,
      description: ride.description || "",
      startTime: new Date(ride.startTime),
      endTime: new Date(ride.endTime),
      totalSeats: ride.totalSeats || DEFAULT_TOTAL_SEATS,
      currentTakenSeats: DEFAULT_TAKEN_SEATS_FOR_CREATOR,
      isClosed: false,
      hasCar: ride.hasCar ?? false,
    },
  });

  console.log(`DB RIDE: Ride created by ${user.netId}, Details: `, newRide);
  return newRide;
}
