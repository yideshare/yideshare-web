import FeedPageClient from "@/app/feed/feed-page-client";
import { findBookmarkedRides, findManyRides, getUserFromCookies } from "@/lib/db";
import { Ride } from "@prisma/client";


export default async function Feed() {
  /* ----------------  auth  ---------------- */
    const { user } = await getUserFromCookies();
    const netId = user?.netId ?? null;
  
    if (netId === null) {
      return <div>Please log in to view your rides.</div>;
    }
  
    /* ----------------  data  ---------------- */
    const numInitialRides = 500
    const initialRides = await findManyRides(numInitialRides);
    const bookmarks = await findBookmarkedRides(netId);
    const bookmarkedRideIds = bookmarks.map((b: { ride: Ride }) => b.ride.rideId);
  
    /* ----------------  UI  ---------------- */
    return (
      <FeedPageClient
        initialRides={initialRides}
        bookmarkedRideIds={bookmarkedRideIds}
      />
    );
}
