// yideshare/app/your-rides/page.tsx
import { redirect } from "next/navigation";
import { prisma, findBookmarkedRides, getUserNetIdFromCookies } from "@/lib/db";
import YourRidesClient from "./your-rides-client";

export default async function DashboardPage() {
  // server-side: verify httpOnly JWT w/ updated helper, chat helped with this sorry guys desperate times
  const netId = await getUserNetIdFromCookies();
  if (!netId) {
    redirect(`/api/auth/cas-login?next=${encodeURIComponent("/your-rides")}`);
  }

  const numOwnedRides = 100
  const ownedRides = await prisma.ride.findMany({
    take: numOwnedRides,
    where: { ownerNetId: netId, isClosed: false },
    orderBy: { startTime: "desc" },
  });

  // Fetch bookmarks and extract ride IDs
  const bookmarks = await findBookmarkedRides(netId);
  const bookmarkedRideIds = bookmarks.map((b) => b.ride.rideId);

  return (
    <YourRidesClient
      ownedRides={ownedRides}
      bookmarkedRideIds={bookmarkedRideIds}
    />
  );
}
