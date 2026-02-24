// yideshare/app/your-rides/page.tsx

import { redirect } from "next/navigation";

import { prisma, findBookmarkedRides, getUserFromCookies } from "@/lib/db";
import { Ride } from "@prisma/client";

import YourRidesClient from "./your-rides-client";

export default async function DashboardPage() {
  // server-side: verify httpOnly JWT w/ updated helper, chat helped with this sorry guys desperate times
  const { user } = await getUserFromCookies();
  const netId = user?.netId ?? null;
  // if netid is null then redirect to CAS login, and if successful login, redirects back to your rides page
  if (!netId) {
    redirect(`/api/auth/cas-login?next=${encodeURIComponent("/your-rides")}`);
  }

  // Fetch all owned rides
  const ownedRides = await prisma.ride.findMany({
    where: { ownerNetId: netId, isClosed: false },
    orderBy: { startTime: "desc" },
  });

  // Fetch bookmarks and extract ride IDs
  const bookmarks = await findBookmarkedRides(netId);
  const bookmarkedRideIds = bookmarks.map((b: { ride: Ride }) => b.ride.rideId);

  return (
    <YourRidesClient
      ownedRides={ownedRides}
      // Note: though these are passed in they are not shown in the your rides page (hidebookmark set to false in the client)
      bookmarkedRideIds={bookmarkedRideIds}
    />
  );
}
