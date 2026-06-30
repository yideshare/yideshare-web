import { prisma } from "@/lib/db";

export async function bookmarkRide(netId: string, rideId: string) {
  // Try to find bookmark
  const existing = await prisma.bookmark.findUnique({
    where: { netId_rideId: { netId, rideId } },
  });

  if (existing) {
    // Delete bookmark from database
    await prisma.bookmark.delete({
      where: { netId_rideId: { netId, rideId } },
    });
    return false;
    // No bookmark exists, so create one
  } else {
    await prisma.bookmark.create({
      data: { netId, rideId },
    });
    return true;
  }
}
