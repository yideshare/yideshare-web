import { prisma } from "@/lib/db";
import { logger } from "@/lib/infra"
import { Ride } from "@prisma/client";
import { RideWhereClauseWithArrayAND } from "@/app/interface/main";

export async function createRide(ride: Ride, user: {netId: string; name: string; email: string }): Promise<Ride> {
  try {
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
        totalSeats: ride.totalSeats || 4,
        currentTakenSeats: 0,
        isClosed: false,
        hasCar: ride.hasCar ?? false,
      },
    });
    logger.info(`DB RIDE: Ride created by ${user.netId}, Details: `, newRide);
    return newRide;
  } catch (error) {
    logger.error("DB RIDE: Error creating ride:", error);
    throw error;
  }
}

export async function closeRide(rideId: string): Promise<Ride | null> {
  try {
    const updatedRide = await prisma.ride.update({
      where: { rideId },
      data: { isClosed: true },
    });
    return updatedRide;
  } catch (error) {
    logger.error("DB RIDE: Error closing ride:", error);
    return null;
  }
}

export async function bookmarkRide(netId: string, rideId: string): Promise<{ bookmarked: boolean }> {
  // try to find bookmark
  const existing = await prisma.bookmark.findUnique({
    where: { netId_rideId: { netId, rideId } },
  });

  // if a bookmark exists
  if (existing) {
    // delete bookmark from database
    await prisma.bookmark.delete({
      where: { netId_rideId: { netId, rideId } },
    });
    return { bookmarked: false };
    // otherwise
  } else {
    // no bookmark exists, so create one
    await prisma.bookmark.create({
      data: { netId, rideId },
    });
    return { bookmarked: true };
  }
}

export async function findManyRides(quantity: number): Promise<Ride[]> {
  return prisma.ride.findMany({
    take: quantity,
    where: {
      isClosed: false,
    },
  });
}

// find all bookmarked rides associated with a user
export async function findBookmarkedRides(netId: string): Promise<{ ride: Ride }[]> {
  return prisma.bookmark.findMany({
    where: { netId },
    select: { ride: true },
  });
}

// Coarse DB-level filter by location and datetime range.
export async function findFilteredRides(
  from: string,
  to: string,
  filterStartTime?: Date | null,
  filterEndTime?: Date | null,
): Promise<Ride[]> {
  // Build the where clause dynamically based on non-empty criteria
  const whereClause: RideWhereClauseWithArrayAND = {
    AND: [{ isClosed: false }],
  };

  // Only add location filters if they're not empty
  if (from) {
    whereClause.AND.push({
      beginning: {
        contains: from,
        mode: "insensitive",
      },
    });
  }
  if (to) {
    whereClause.AND.push({
      destination: {
        contains: to,
        mode: "insensitive",
      },
    });
  }

  const hasStart = !!(filterStartTime && !isNaN(filterStartTime.getTime()));
  const hasEnd = !!(filterEndTime && !isNaN(filterEndTime.getTime()));

  if (hasStart && hasEnd) {
    whereClause.AND.push({
      // Ride starts before or at the filter end time
      // and ends after or at the filter start time
      startTime: { lte: filterEndTime },
      endTime: { gte: filterStartTime },
    });
  }

  return prisma.ride.findMany({
    where: whereClause,
    orderBy: {
      startTime: "asc",
    },
  });
}
