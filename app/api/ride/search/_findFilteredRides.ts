import { prisma } from "@/lib/db";

import type { Prisma } from "@/prisma/generated/prisma/client";

interface RideWhereClauseWithArrayAND {
  AND: Prisma.RideWhereInput[];
}

export async function findFilteredRides(
  from: string | null,
  to: string | null,
  startTimeObject: Date | null,
  endTimeObject: Date | null
) {
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

  if (startTimeObject && endTimeObject) {
    // Rides that overlap with the time range
    whereClause.AND.push({
      startTime: { lte: endTimeObject },
      endTime: { gte: startTimeObject },
    });
  }

  return prisma.ride.findMany({
    where: whereClause,
    orderBy: {
      startTime: "asc",
    },
  });
}
