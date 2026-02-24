// app/results/page.tsx

import { Ride } from "@prisma/client";
import { createStartEndDateTimes } from "@/lib/parsers";
import { findBookmarkedRides, findFilteredRides, getUserFromCookies } from "@/lib/db";
import { extractSearchParams } from "@/lib/parsers";
import FeedPageClient from "../feed/feed-page-client";

type searchParamsType = {
  from: string;
  to: string;
  date: string;
  startTime: string;
  endTime: string;
  // plus any other optional fields you expect
}

export default async function Results({ searchParams }: { searchParams: Promise<searchParamsType> }) {
  const resolvedSearchParams = await searchParams;
  // get user cookies
  const { user } = await getUserFromCookies();
  const netId = user?.netId ?? null;

  // if no user cookies were found
  if (netId === null) {
    return <div>Please log in to view your rides.</div>;
  }

  // extract search parameters into query fields
  const {
    from,
    to,
    date,
    startTime: startTimeString,
    endTime: endTimeString,
  } = extractSearchParams(resolvedSearchParams);

  // create start and end time objects
  const { startTimeObject, endTimeObject } = createStartEndDateTimes(
    date,
    startTimeString,
    endTimeString
  );

  // fetch rides that match filter criteria
  const filteredRides = await findFilteredRides(
    from,
    to,
    startTimeObject,
    endTimeObject
  );
  
  // fetch bookmarked rides
  const bookmarks = await findBookmarkedRides(netId);
  const bookmarkedRideIds = bookmarks.map((b: { ride: Ride }) => b.ride.rideId);

  return (
    <FeedPageClient 
      initialRides={filteredRides} 
      bookmarkedRideIds={bookmarkedRideIds} 
    />
  );
}