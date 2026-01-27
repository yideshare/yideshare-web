"use client";
import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { FeedHeader, FeedSortBar, FeedList } from "@/components/feed";
import { useSortedRides } from "@/hooks/useSortedRides";
import { Ride } from "@prisma/client";

interface BookmarksClientProps {
  bookmarkedRides: Ride[];
}

export default function BookmarksClient({
  bookmarkedRides,
}: BookmarksClientProps) {
  const [sortBy, setSortBy] = React.useState("recent");
  const [localBookmarkedRides, setLocalBookmarkedRides] =
    React.useState<Ride[]>(bookmarkedRides);
  const sortedRides = useSortedRides(localBookmarkedRides, sortBy);
  const handleUnbookmark = (rideId: string) => {
    setLocalBookmarkedRides((rides) =>
      rides.filter((r) => r.rideId !== rideId)
    );
  };

  return (
    <div className="bg-white min-h-screen">
      <FeedHeader feedbackUrl="https://docs.google.com/forms/u/1/d/1h6MQYNtshyOujGAfsj2R1mqOdoNTy8YoY0MUdGc1-yo/edit?usp=drive_web" />
      <div className="relative flex flex-1 flex-col p-6 bg-white">
        <FeedSortBar sortBy={sortBy} setSortBy={setSortBy} />
        <Separator className="mb-4" />
        <div className="pt-16 flex justify-center">
          <FeedList
            rides={sortedRides}
            bookmarkedRideIds={localBookmarkedRides.map((r) => r.rideId)}
            onUnbookmark={handleUnbookmark} // Pass the handler down
          />
        </div>
      </div>
    </div>
  );
}
