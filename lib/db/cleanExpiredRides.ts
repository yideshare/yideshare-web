import { prisma } from "@/lib/db";

export async function closeExpiredRides() {
  const now = new Date();

  // Close expired rides
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
  
  // Log number of rides closed
  console.log(`DB RIDE: Closed ${result.count} expired rides.`);

  return { ridesClosed: result.count };
}
