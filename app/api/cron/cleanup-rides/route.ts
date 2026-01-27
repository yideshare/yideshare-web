import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger, withApiErrorHandler } from "@/lib/infra"

// add this to a vercel cron script when deployed
// currently closing them (but not permanently deleting them) - trying this first and then will update

async function closeExpiredRides() {
  const now = new Date();

  // Log what rides will be closed
  const expiredRides = await prisma.ride.findMany({
    where: {
      endTime: {
        lt: now,
      },
      isClosed: false,
    },
    select: {
      rideId: true,
      beginning: true,
      destination: true,
      startTime: true,
      endTime: true,
    },
  });

  logger.info(`CRON: Found ${expiredRides.length} expired rides to close`);

  if (expiredRides.length > 0) {
    logger.info(`CRON: Ride details:`, expiredRides);
  }

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

  logger.info(`CRON: Closed ${result.count} expired rides`);

  return { ridesClosed: result.count };
}

async function handler(request: Request) {
  // Vercel Cron Authorization header (CRON_SECRET).
  const authHeader = request.headers.get("authorization") ?? undefined;

  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    logger.warn("CRON: Unauthorized access attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Proceed with the cron job
  const result = await closeExpiredRides();
  return NextResponse.json({ success: true, ...result });
}

export const GET = withApiErrorHandler(handler);
