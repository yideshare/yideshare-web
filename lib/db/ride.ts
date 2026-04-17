import { prisma } from "@/lib/db";

/**
 * Fetches a limited number of open rides from the database.
 *
 * @param quantity - The maximum number of rides to return
 * @returns A list of open rides up to the specified quantity
 */
export async function findManyRides(quantity: number) {
  return prisma.ride.findMany({
    take: quantity,
    where: {
      isClosed: false,
    },
  });
}

/**
 * Fetches all rides bookmarked by a specific user.
 *
 * @param netId - The NetID of the user whose bookmarks to retrieve
 * @returns A list of bookmark records with their associated ride data
 */
export async function findBookmarkedRides(netId: string) {
  return prisma.bookmark.findMany({
    where: { netId },
    select: { ride: true },
  });
}

/**
 * Fetches all open rides owned by a specific user, ordered by most recent.
 *
 * @param netId - The NetID of the ride owner
 * @returns A list of open rides belonging to the user
 */
export async function findOwnedRides(netId: string) {
  return prisma.ride.findMany({
    where: { ownerNetId: netId, isClosed: false },
    orderBy: { startTime: "desc" },
  });
}
