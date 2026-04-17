"use client";

import { useState } from "react";

import { Separator } from "@/components/ui/separator";
import { FeedHeader, FeedSortBar, FeedList } from "@/components/feed";
import { useSortedRides } from "@/hooks/useSortedRides";
import { useToast } from "@/hooks/useToast";
import type { Ride } from "@/prisma/generated/prisma/client";

import { EditRideDialog } from "./EditRideDialog";

interface YourRidesClientProps {
  ownedRides: Ride[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export default function YourRidesClient({ ownedRides }: YourRidesClientProps) {
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState<string>("recent");
  const [localRides, setLocalRides] = useState<Ride[]>(ownedRides);
  const [editingRide, setEditingRide] = useState<Ride | null>(null);

  const sortedRides = useSortedRides(localRides, sortBy);

  const handleDeleteRide = async (rideId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/ride/update?rideId=${rideId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete ride");
      }

      setLocalRides((prev) => prev.filter((ride) => ride.rideId !== rideId));

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
        `${API_BASE}/api/ride/update?rideId=${editingRide.rideId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedRide),
        }
      );

      if (!res.ok) throw new Error("Failed to update ride");

      const updatedRideData = await res.json();

      setLocalRides((prev) =>
        prev.map((ride) =>
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
            bookmarkedRideIds={[]}
            showDialog={false}
            hideBookmark={true}
            editable
            onEdit={(ride: Ride) => setEditingRide(ride)}
            onDelete={handleDeleteRide}
          />
        </div>
      </div>
      {editingRide && (
        <EditRideDialog
          open={true}
          setOpen={(v) => {
            if (!v) setEditingRide(null);
          }}
          ride={editingRide}
          onSave={handleEditRide}
        />
      )}
    </div>
  );
}
