import { prisma } from "@/lib/db";
import { logger } from "@/lib/infra"

export async function closeExpiredRides() {
  const now = new Date();

  // Purely for logging what rides will be closed - can be used for debugging if needed
  // get rides that are open and have happened in the past (before now)
  // const expiredRides = await prisma.ride.findMany({
  //   where: {
  //     endTime: {
  //       lt: now,
  //     },
  //     isClosed: false,
  //   },
  //   select: {
  //     rideId: true,
  //     beginning: true,
  //     destination: true,
  //     startTime: true,
  //     endTime: true,
  //   },
  // });

  // logger.info(`CRON: Found ${expiredRides.length} expired rides to close`);

  // if (expiredRides.length > 0) {
  //   logger.info(`CRON: Ride details:`, expiredRides);
  // }

  // Close the rides
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
  
  // log number of rides closed
  logger.info(`DB RIDE: Closed ${result.count} expired rides.`);

  return { ridesClosed: result.count };
}
