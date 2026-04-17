import { findBookmarkedRides, findManyRides } from "@/lib/db";
import { getUserNetIdFromCookies } from "@/lib/cookies";

import FeedPageClient from "./FeedPageClient";

export default async function Feed() {
  const netId = await getUserNetIdFromCookies();

  if (netId === null) {
    return <div>Please log in to view your rides.</div>;
  }

  const numInitialRides = 500;
  const initialRides = await findManyRides(numInitialRides);
  const bookmarks = await findBookmarkedRides(netId);
  const bookmarkedRideIds = bookmarks.map((b) => b.ride.rideId);

  return (
    <FeedPageClient
      initialRides={initialRides}
      bookmarkedRideIds={bookmarkedRideIds}
    />
  );
}
