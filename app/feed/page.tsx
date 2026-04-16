import FeedPageClient from "./feed-page-client";
import { findBookmarkedRides, findManyRides } from "@/lib/db";
import { getUserNetIdFromCookies } from "@/lib/cookies";


export default async function Feed() {
  /* ----------------  auth  ---------------- */
    const netId = await getUserNetIdFromCookies();

    if (netId === null) {
      return <div>Please log in to view your rides.</div>;
    }

    /* ----------------  data  ---------------- */
    const numInitialRides = 500;
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
