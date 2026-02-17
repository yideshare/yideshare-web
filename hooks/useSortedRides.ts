import { useEffect, useState } from "react";
import { Ride } from "@prisma/client";

export function useSortedRides(rides: Ride[], sortBy: string) {
  const [sortedRides, setSortedRides] = useState<Ride[]>([]);

  // sort by recent, oldest (by date), or alphabetical (by leaving from)
  useEffect(() => {
    const sorted = [...rides];
    switch (sortBy) {
      case "recent":
        sorted.sort((a, b) => +new Date(b.startTime) - +new Date(a.startTime));
        break;
      case "oldest":
        sorted.sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime));
        break;
      case "alphabetical":
        sorted.sort((a, b) => (a.beginning ?? "").localeCompare(b.beginning ?? ""));
        break;
    }
    setSortedRides(sorted);
  }, [rides, sortBy]);

  return sortedRides;
}