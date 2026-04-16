import { prisma } from "@/lib/db";

/**
 * @internal
 * @private Only for use within /api/rides/close-expired route.
 */
export async function closeExpiredRides() {
  const now = new Date();

  const result = await prisma.ride.updateMany({
    where: {
      endTime: {
        lt: now,
      },
      isClosed: false,
    },
    data: {
      isClosed: true,
    },
  });

  console.log(`DB RIDE: Closed ${result.count} expired rides.`);

  return { ridesClosed: result.count };
}
