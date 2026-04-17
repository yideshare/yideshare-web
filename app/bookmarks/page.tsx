import { findBookmarkedRides } from "@/lib/db";
import { getUserNetIdFromCookies } from "@/lib/cookies";

import BookmarksClient from "./BookmarksClient";

export default async function BookmarkPage() {
  const netId = await getUserNetIdFromCookies();

  if (netId === null) {
    return <div>Please log in to view your rides.</div>;
  }

  const bookmarks = await findBookmarkedRides(netId);
  const bookmarkedRides = bookmarks.map((b) => b.ride);

  return <BookmarksClient bookmarkedRides={bookmarkedRides} />;
}
