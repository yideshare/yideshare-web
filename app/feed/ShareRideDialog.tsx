"use client";

import { useState, useEffect, FormEvent } from "react";

import { createStartEndDateTimes } from "@/lib/time";
import { useToast } from "@/hooks/useToast";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CustomSelect } from "@/components/ui/select";
import { TimeSelect } from "@/components/ui/time-select";
import { CustomPhoneInput } from "@/components/ui/phone-input";

import type { Ride } from "@/prisma/generated/prisma/client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

// ------- TYPES -------

interface ShareRideDialogProps {
  open: boolean;
  setOpen: (v: boolean) => void;

  /* Shared search fields — kept in sync with the top bar */
  from: string;
  setFrom: (v: string) => void;
  to: string;
  setTo: (v: string) => void;
  date: Date | null;
  startTime: string;
  setStartTime: (v: string) => void;
  endTime: string;
  setEndTime: (v: string) => void;

  rides?: Ride[];
  onSuccess: (rides: Ride[]) => void;
}

// ------- COMPONENT -------

export function ShareRideDialog({
  open,
  setOpen,
  from,
  setFrom,
  to,
  setTo,
  date,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  rides,
  onSuccess,
}: ShareRideDialogProps) {
  const { toast } = useToast();

  const [organizerName, setOrganizerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [additionalPassengers, setAdditionalPassengers] = useState(3);
  const [description, setDescription] = useState("");
  const [hasCar, setHasCar] = useState(false);

  const [meLoading, setMeLoading] = useState(true);
  const [meError, setMeError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setMeLoading(true);
        setMeError(null);
        const res = await fetch("/api/me", { method: "GET", cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load user (${res.status})`);
        const me = await res.json();
        if (!ignore) {
          if (me?.name) setOrganizerName(me.name);
          if (me?.email) setUserEmail(me.email);
        }
      } catch (e: unknown) {
        if (!ignore) {
          setMeError(e instanceof Error ? e.message : "Failed to load user");
        }
      } finally {
        if (!ignore) setMeLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // TODO: add more required field validation
  const ready = from && to && startTime && endTime && organizerName;

  async function handleShareRide(e: FormEvent) {
    e.preventDefault();

    // Easter Egg
    if (to.trim().toLowerCase() === "harvard university") {
      window.location.href = "https://www.youtube.com/watch?v=bMM3z3o6BAs";
      return;
    }

    // TODO: remove once date field is added to the post ride popup
    if (!date) {
      toast({
        title: "Select a date",
        description: "Please choose a date before posting a ride.",
        variant: "destructive",
      });
      return;
    }

    const { startTimeObject, endTimeObject } = createStartEndDateTimes(
      date,
      startTime,
      endTime
    );

    const rideData = {
      ownerName: organizerName,
      ownerPhone: phoneNumber,
      beginning: from,
      destination: to,
      description,
      startTime: startTimeObject,
      endTime: endTimeObject,
      totalSeats: additionalPassengers + 1,
      hasCar,
    };

    try {
      const res = await fetch(`${API_BASE}/api/ride/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rideData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to post ride");
      }

      const newRide = await res.json();

      if (rides) {
        onSuccess([newRide.ride, ...rides]);
      }

      setFrom("");
      setTo("");
      setStartTime("");
      setEndTime("");
      setOrganizerName("");
      setPhoneNumber("");
      setAdditionalPassengers(0);
      setDescription("");
      setHasCar(false);

      toast({
        title: "Ride Posted",
        description: "Your ride has been successfully posted.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to post ride. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span />
      </DialogTrigger>

      <DialogContent className="w-full max-w-sm sm:max-w-xl bg-white m-1 max-h-[calc(100dvh-1rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Share a Ride</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Fill out the details below to create a new ride listing.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            handleShareRide(e);
            setOpen(false);
          }}
          className="space-y-2 sm:space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="organizer">Organizer name</Label>
            <Input
              id="organizer"
              value={organizerName}
              readOnly
              placeholder={meLoading ? "Loading..." : meError ? "Failed to load" : "Full name"}
              className="text-base"
            />
            {meError && <p className="text-xs text-red-500">{meError}</p>}
          </div>

          <div className="space-y-2 text-base">
            <CustomPhoneInput
              label="Phone Number"
              value={phoneNumber}
              onChange={setPhoneNumber}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={userEmail}
              readOnly
              placeholder={meLoading ? "Loading..." : meError ? "Failed to load" : "Email"}
              className="text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="from">
                Leaving from <span className="text-red-500">*</span>
              </Label>
              <Input
                id="from"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                required
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="to">
                Heading to <span className="text-red-500">*</span>
              </Label>
              <Input
                id="to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
                className="text-base"
              />
            </div>

            <div className="space-y-2 text-base">
              <TimeSelect
                label={
                  <>
                    Earliest departure <span className="text-red-500">*</span>
                  </>
                }
                value={startTime}
                onChange={setStartTime}
              />
            </div>

            <div className="space-y-2 text-base">
              <TimeSelect
                label={
                  <>
                    Latest departure <span className="text-red-500">*</span>
                  </>
                }
                value={endTime}
                onChange={setEndTime}
              />
            </div>
          </div>

          <div className="space-y-2 text-base">
            <CustomSelect
              label={
                <>
                  Do you have your own car? <span className="text-red-500">*</span>
                </>
              }
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No, I'd like to split with Uber/Lyft" },
              ]}
              value={hasCar ? "yes" : "no"}
              onChange={(value) => setHasCar(value === "yes")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seats">
              Number of Open Seats <span className="text-red-500">*</span>
            </Label>
            <Input
              id="seats"
              type="number"
              min="1"
              max="10"
              placeholder="3"
              value={additionalPassengers === 0 ? "" : additionalPassengers}
              onChange={(e) => {
                const val = e.target.value;
                setAdditionalPassengers(val === "" ? 0 : parseInt(val));
              }}
              required
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">
              Description <span>(optional)</span>
            </Label>
            <Textarea
              className="bg-white text-base"
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="I have two suitcases, planning to order an UberXL..."
              rows={3}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={!ready}>
              Post Ride
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
