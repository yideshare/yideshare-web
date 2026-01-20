"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Bookmark } from "lucide-react";
import { formatPhoneNumberIntl } from "react-phone-number-input";

import { Card } from "@/components/ui/card";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { FeedRideCardProps } from "@/app/interface/main";
import { DateTime } from "luxon";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";
export function FeedRideCard({
  ride,
  isBookmarkedInitial,
  showDialog = true,
  hideBookmark = false, // add default
  onUnbookmark,
}: FeedRideCardProps & {
  hideBookmark?: boolean;
  onUnbookmark?: (rideId: string) => void;
}) {
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = React.useState(isBookmarkedInitial);

  /* ------------ helpers ------------ */
  const ownerName = ride.ownerName ?? "Driver";
  const totalSeats = ride.totalSeats;

  const zone = "America/New_York";
  const sLux = DateTime.fromJSDate(new Date(ride.startTime)).setZone(zone);
  const eLux = DateTime.fromJSDate(new Date(ride.endTime)).setZone(zone);
  const dateLabel = sLux.toFormat("d LLL");

  // check if end date is different from start date in EST (next day)
  const isNextDay = eLux.hasSame(sLux, "day") === false;
  const timeLabel = `${sLux.toFormat("h:mm a")} - ${eLux.toFormat("h:mm a")}${
    isNextDay ? " (+1)" : ""
  }`;

  /* ------------ bookmark ------------ */
  async function handleBookmark() {
    try {
      const res = await fetch(`${API_BASE}/api/bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rideId: ride.rideId }),
      });
      const data = await res.json();
      setIsBookmarked(data.bookmarked);
      if (!data.bookmarked && onUnbookmark) {
        onUnbookmark(ride.rideId);
      }
      toast({
        title: data.bookmarked ? "Ride Bookmarked" : "Bookmark Removed",
      });
    } catch {
      toast({ title: "Error", description: "Could not update bookmark." });
    }
  }

  /* ------------ UI ------------ */
  const cardContent = (
    <Card className="rounded-2xl border border-border bg-white px-3 sm:px-6 py-3 sm:py-4 shadow-card hover:shadow-cardHover cursor-pointer">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-1">
        <div>
          <p className="text-sm sm:text-lg font-medium text-black mb-1">
            Leaving from
          </p>
          <p className="text-lg sm:text-2xl font-semibold text-black break-words">
            {ride.beginning}
          </p>
        </div>

        <div>
          <p className="text-sm sm:text-lg font-medium text-black mb-1">
            Going to
          </p>
          <p className="text-lg sm:text-2xl font-semibold text-black break-words">
            {ride.destination}
          </p>
        </div>

        <div>
          <p className="text-sm sm:text-lg font-medium text-black mb-1">Date</p>
          <p className="text-lg sm:text-2xl font-semibold text-black">
            {dateLabel}
          </p>
        </div>

        <div>
          <p className="text-sm sm:text-lg font-medium text-black mb-1">
            Departure Time Range (EST)
          </p>
          <p className="text-lg sm:text-2xl font-semibold text-black">
            {timeLabel}
          </p>
        </div>
      </div>

      <div className="h-px bg-border my-3 sm:my-4" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-muted text-lg sm:text-2xl font-semibold text-black">
            {ownerName[0]}
          </div>
          <div className="flex flex-col gap-1 text-black">
            <span className="text-lg sm:text-xl">{ownerName}</span>
            <span className="text-sm sm:text-xl text-black break-all">
              {ride.ownerPhone
                ? formatPhoneNumberIntl(ride.ownerPhone)
                : "No phone provided"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {!hideBookmark && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleBookmark();
              }}
            >
              <Bookmark
                className="h-4 w-4 sm:h-5 sm:w-5 text-primary"
                style={{ fill: isBookmarked ? "currentColor" : "none" }}
              />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  if (!showDialog) {
    return cardContent;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{cardContent}</DialogTrigger>

      {/* -------- Dialog -------- */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-black">
            Ride Details
          </DialogTitle>
          <div className="mt-4">
            <div className="flex items-center text-lg text-black">
              <span>Posted by: {ride.ownerName || "Raymond Hou"}</span>
              <span className="mx-2">•</span>
              <span>{totalSeats - 1} seats available</span>
            </div>
            {ride.ownerPhone && (
              <div className="text-lg text-black mt-1">
                Phone: {formatPhoneNumberIntl(ride.ownerPhone)}
              </div>
            )}
            <div className="text-lg text-black mt-1">
              Description:{" "}
              {ride.description
                ? ride.description
                : "No additional information provided"}
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <label className="text-sm font-bold text-black">Date</label>
              <p className="text-lg font-medium text-black">{dateLabel}</p>
            </div>
            <div className="flex-1">
              <label className="text-sm font-bold text-black">
                Departure Time Range (EST)
              </label>
              <p className="text-lg font-medium text-black">{timeLabel}</p>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
