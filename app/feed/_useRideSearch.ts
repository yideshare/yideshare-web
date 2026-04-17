import { useState } from "react";

import { useToast } from "@/hooks/useToast";

import type { Ride } from "@/prisma/generated/prisma/client";

/**
 * @internal
 * @private Only for use within app/feed/TopBar.tsx.
 *
 * Manages ride search state and handlers, including the search form fields,
 * API call, and the Harvard Easter Egg redirect.
 */
export function useRideSearch(onResults: (rides: Ride[]) => void) {
  const { toast } = useToast();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Easter Egg
  function checkHarvardRedirect(destination: string): boolean {
    if (destination.trim().toLowerCase() === "harvard university") {
      window.location.href = "https://www.youtube.com/watch?v=bMM3z3o6BAs";
      return true;
    }
    return false;
  }

  async function handleFindRide() {
    if (checkHarvardRedirect(to)) return;

    const hasFrom = from.trim().length > 0;
    const hasTo = to.trim().length > 0;
    const hasDate = date !== null;
    const hasStart = startTime.trim().length > 0;
    const hasEnd = endTime.trim().length > 0;
    const hasTimeWindow = hasStart || hasEnd;

    if (!(hasFrom || hasTo || hasDate || hasTimeWindow)) {
      toast({
        title: "Add a filter",
        description:
          "Enter at least one of 'Leaving from', 'Going to', 'Date', or 'Departure Time Range'.",
      });
      onResults([]);
      setHasSearched(true);
      return;
    }

    const params = new URLSearchParams();
    if (hasFrom) params.set("from", from);
    if (hasTo) params.set("to", to);
    if (hasDate && date) params.set("date", date.toISOString());
    if (hasStart) params.set("startTime", startTime);
    if (hasEnd) params.set("endTime", endTime);

    try {
      const res = await fetch(`/api/ride/search?${params.toString()}`);
      if (!res.ok) throw new Error("Network error");
      const ridesResult: Ride[] = await res.json();
      onResults(ridesResult);
      setHasSearched(true);
    } catch (error) {
      console.error(error);
      onResults([]);
      setHasSearched(true);
    }
  }

  function handleClearSearch() {
    window.location.reload();
  }

  return {
    from, setFrom,
    to, setTo,
    date, setDate,
    startTime, setStartTime,
    endTime, setEndTime,
    hasSearched,
    handleFindRide,
    handleClearSearch,
  };
}
