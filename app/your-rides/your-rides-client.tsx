"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { FeedHeader, FeedSortBar, FeedList } from "@/components/feed";
import { useSortedRides } from "@/hooks/useSortedRides";
import { EditRideDialog } from "@/components/rides";
import { useToast } from "@/hooks/useToast";
import { Ride } from "@prisma/client";

interface YourRidesClientProps {
  ownedRides: Ride[];
  bookmarkedRideIds: string[];
}
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export default function YourRidesClient({
  ownedRides,
  bookmarkedRideIds,
}: YourRidesClientProps) {
  const { toast } = useToast();
  const [sortBy, setSortBy] = React.useState<string>("recent");
  const [localRides, setLocalRides] = React.useState<Ride[]>(ownedRides);
  const [editingRide, setEditingRide] = React.useState<Ride | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  React.useEffect(() => {
    setLocalRides(ownedRides);
  }, [ownedRides]);

  const sortedRides = useSortedRides(localRides, sortBy);

  const handleDeleteRide = async (rideId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/rides/update?rideId=${rideId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete ride");
      }

      setLocalRides(localRides.filter((ride) => ride.rideId !== rideId));

      toast({
        title: "Ride Deleted",
        description: "Your ride has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete ride. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditRide = async (updatedRide: Partial<Ride>) => {
    if (!editingRide) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/rides/update?rideId=${editingRide.rideId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedRide),
        }
      );

      if (!res.ok) throw new Error("Failed to update ride");

      const updatedRideData = await res.json();

      setLocalRides(
        localRides.map((ride) =>
          ride.rideId === editingRide.rideId ? updatedRideData : ride
        )
      );

      toast({
        title: "Ride Updated",
        description: "Your ride has been successfully updated.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update ride. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <FeedHeader feedbackUrl="https://docs.google.com/forms/d/e/1FAIpQLSeVXC0N53MouFwl23_1aJe19EkatPym_VwIXv2uzm3W4DuhkA/viewform?usp=dialog" />
      <div className="relative flex flex-1 flex-col p-6 bg-white">
        <FeedSortBar sortBy={sortBy} setSortBy={setSortBy} />
        <Separator className="mb-4" />
        <div className="pt-16 flex justify-center">
          <FeedList
            rides={sortedRides}
            bookmarkedRideIds={bookmarkedRideIds}
            showDialog={false}
            hideBookmark={true}
            editable
            onEdit={(ride: Ride) => {
              setEditingRide(ride);
              setIsEditDialogOpen(true);
            }}
            onDelete={handleDeleteRide}
          />
        </div>
      </div>
      {editingRide && (
        <EditRideDialog
          open={isEditDialogOpen}
          setOpen={setIsEditDialogOpen}
          ride={editingRide}
          onSave={handleEditRide}
        />
      )}
    </div>
  );
}
