"use client";

import { useState } from "react";

import { Separator } from "@/components/ui/separator";
import { FeedHeader, FeedSortBar, FeedList } from "@/components/feed";
import { useSortedRides } from "@/hooks/useSortedRides";

import type { Ride } from "@/prisma/generated/prisma/client";

import { TopBar } from "./TopBar";

interface FeedPageClientProps {
  initialRides: Ride[];
  bookmarkedRideIds: string[];
}

export default function FeedPageClient({
  initialRides,
  bookmarkedRideIds,
}: FeedPageClientProps) {
  const [sortBy, setSortBy] = useState("recent");
  const [localRides, setRides] = useState(initialRides);
  const sortedRides = useSortedRides(localRides, sortBy);

  return (
    <div className="bg-white min-h-screen">
      <FeedHeader feedbackUrl="https://forms.gle/DjypxU7tayRGVVMu5" />
      <div className="px-8">
        <TopBar onResults={setRides} rides={localRides} />
      </div>
      <div className="relative flex flex-1 flex-col p-6 bg-white">
        <FeedSortBar sortBy={sortBy} setSortBy={setSortBy} />
        <Separator className="mb-4" />
        <div className="pt-16 flex justify-center">
          <FeedList rides={sortedRides} bookmarkedRideIds={bookmarkedRideIds} />
        </div>
      </div>
    </div>
  );
}
