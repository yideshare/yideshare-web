import FeedPageClient from "@/app/feed/feed-page-client";
import { findBookmarkedRides, findManyRides, getUserNetIdFromCookies } from "@/lib/db";


export default async function Feed() {
  /* ----------------  auth  ---------------- */
    const netId = await getUserNetIdFromCookies();
  
    if (netId === null) {
      return <div>Please log in to view your rides.</div>;
    }
  
    /* ----------------  data  ---------------- */
    const numInitialRides = 500
    const initialRides = await findManyRides(numInitialRides);
    const bookmarks = await findBookmarkedRides(netId);
    const bookmarkedRideIds = bookmarks.map((b) => b.ride.rideId);
  
    /* ----------------  UI  ---------------- */
    return (
      <FeedPageClient
        initialRides={initialRides}
        bookmarkedRideIds={bookmarkedRideIds}
      />
    );
}
