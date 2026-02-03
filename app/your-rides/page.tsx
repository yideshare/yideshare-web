// yideshare/app/your-rides/page.tsx
import { redirect } from "next/navigation";
import { prisma, findBookmarkedRides, getUserNetIdFromCookies } from "@/lib/db";
import YourRidesClient from "./your-rides-client";

export default async function DashboardPage() {
  // server-side: verify httpOnly JWT w/ updated helper, chat helped with this sorry guys desperate times
  const netId = await getUserNetIdFromCookies();
  // if netid is null then redirect to CAS login, and if successful login, redirects back to your rides page
  if (!netId) {
    redirect(`/api/auth/cas-login?next=${encodeURIComponent("/your-rides")}`);
  }

  // Fetch owned rides matching the user that are open
  const ownedRides = await prisma.ride.findMany({
    where: { ownerNetId: netId, isClosed: false },
    orderBy: { startTime: "desc" },
  });

  // Fetch bookmarks and extract ride IDs
  const bookmarks = await findBookmarkedRides(netId);
  const bookmarkedRideIds = bookmarks.map((b) => b.ride.rideId);

  return (
    <YourRidesClient
      ownedRides={ownedRides}
      // note: though these are passed in they are not shown in the your rides page (hidebookmark set to false in the client)
      bookmarkedRideIds={bookmarkedRideIds}
    />
  );
}
