import { FeedRideCard } from "@/components/feed";
import { Ride } from "@/prisma/generated/prisma/client";
import React from "react";
import { Trash2, Pencil } from "lucide-react";

interface FeedListProps {
  rides: Ride[];
  bookmarkedRideIds?: string[];
  showDialog?: boolean;
  hideBookmark?: boolean;
  onEdit?: (ride: Ride) => void;
  onDelete?: (rideId: string) => void;
  editable?: boolean;
  onUnbookmark?: (rideId: string) => void;
}

export function FeedList({
  rides,
  bookmarkedRideIds = [],
  showDialog = true,
  hideBookmark = false,
  onEdit,
  onDelete,
  editable = false,
  onUnbookmark,
}: FeedListProps) {
  if (!rides.length) {
    return <p className="text-black">No rides available.</p>;
  }
  return (
    <div className="flex flex-col gap-6 max-w-[1200px] w-full">
      {rides.map((ride) => (
        <div key={ride.rideId} className="w-full relative">
          {editable && onDelete && (
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                className="text-red-500"
                onClick={() => onDelete(ride.rideId)}
                aria-label="Delete"
              >
                <Trash2 className="h-5 w-5 text-red-500" />
              </button>
            </div>
          )}
          {editable && onEdit && (
            <div className="absolute bottom-3 right-3 flex gap-2">
              <button
                className="text-blue-500"
                onClick={() => onEdit(ride)}
                aria-label="Edit"
              >
                <Pencil className="h-5 w-5 text-blue-500" />
              </button>
            </div>
          )}
          <FeedRideCard
            ride={ride}
            isBookmarkedInitial={bookmarkedRideIds.includes(ride.rideId)}
            showDialog={showDialog}
            hideBookmark={hideBookmark}
            onUnbookmark={onUnbookmark}
          />
        </div>
      ))}
    </div>
  );
}

