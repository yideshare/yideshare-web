// app/bookmarks/page.tsx

import { getUserFromCookies, findBookmarkedRides } from "@/lib/db";
import { Ride } from "@prisma/client";

import BookmarksClient from "./bookmarks-client";

export default async function BookmarkPage() {
  // get user cookies
  const { user } = await getUserFromCookies();
  const netId = user?.netId ?? null;

  // if no user cookies were found
  if (netId === null) {
    return <div>Please log in to view your rides.</div>;
  }

  // fetch bookmarked rides for the authenticated user
  const bookmarks = await findBookmarkedRides(netId);

  // extract the rides from the prisma query
  const bookmarkedRides = bookmarks.map((b: { ride: Ride }) => b.ride);

  return <BookmarksClient bookmarkedRides={bookmarkedRides} />;
}
