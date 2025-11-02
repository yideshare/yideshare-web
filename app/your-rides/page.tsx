// yideshare/app/your-rides/page.tsx
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import YourRidesClient from "./your-rides-client";
import { findBookmarkedRides } from "@/lib/ride";
import { getUserNetIdFromCookies } from "@/lib/user";

export default async function DashboardPage() {
  // server-side: verify httpOnly JWT w/ updated helper, chat helped with this sorry guys desperate times
  const netId = await getUserNetIdFromCookies();
  if (!netId) {
    redirect(`/api/auth/cas-login?next=${encodeURIComponent("/your-rides")}`);
  }

  const ownedRides = await prisma.ride.findMany({
    take: 6,
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
