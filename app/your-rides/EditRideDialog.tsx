"use client";

import * as React from "react";
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
import { TimeSelect } from "@/components/ui/time-select";
import { Ride } from "@/prisma/generated/prisma/client";
import { useState } from "react";
import { CustomPhoneInput } from "@/components/ui/phone-input";
import { createStartEndDateTimes } from "@/lib/time";
import { CustomSelect } from "@/components/ui/select";

import { DateTime } from "luxon";

import { TIME_ZONE } from "@/lib/const";


// Format a JS Date for display as Eastern Time (America/New_York)
export function formatTimeForDisplay(date: Date): string {
  return DateTime.fromJSDate(date).setZone(TIME_ZONE).toFormat("hh:mm a");
}

// logic flow that handles next-day scenarios
const createUpdatedTimes = (
  startTimeStr: string,
  endTimeStr: string,
  originalStartTime: Date
) => {
  // use the original date as the base date for the time conversion
  const baseDate = new Date(originalStartTime);
  const { startTimeObject, endTimeObject } = createStartEndDateTimes(
    baseDate,
    startTimeStr,
    endTimeStr
  );
  return { startTimeObject, endTimeObject };
};

interface EditRideDialogProps {
  ride: Ride;
  setOpen: (v: boolean) => void;
  open: boolean;
  onSave: (updatedRide: Partial<Ride>) => Promise<void>;
}

export function EditRideDialog({
  open,
  setOpen,
  ride,
  onSave,
}: EditRideDialogProps) {
  const [organizerName, setOrganizerName] = React.useState(
    ride.ownerName || ""
  );
  const [phoneNumber, setPhoneNumber] = React.useState(ride.ownerPhone || "");
  const [phoneError, setPhoneError] = React.useState<string | undefined>(
    undefined
  );
  const [organizerEmail, setOrganizerEmail] = React.useState(ride.ownerEmail || "")

  const [formData, setFormData] = useState({
    from: ride.beginning,
    to: ride.destination,
    description: ride.description || "",
    startTime: ride.startTime
      ? formatTimeForDisplay(new Date(ride.startTime))
      : "12:00 AM",
    endTime: ride.endTime
      ? formatTimeForDisplay(new Date(ride.endTime))
      : "12:00 AM",
    additionalPassengers: ride.totalSeats - 1,
  });

  const [hasCar, setHasCar] = React.useState<boolean>(ride.hasCar ?? false);

  const ready =
    formData.from &&
    formData.to &&
    formData.startTime &&
    formData.endTime &&
    formData.additionalPassengers &&
    organizerName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;

    const { startTimeObject, endTimeObject } = createUpdatedTimes(
      formData.startTime,
      formData.endTime,
      new Date(ride.startTime)
    );

    const updatedRide = {
      beginning: formData.from,
      destination: formData.to,
      startTime: startTimeObject,
      endTime: endTimeObject,
      description: formData.description,
      totalSeats: formData.additionalPassengers + 1,
      ownerName: organizerName,
      ownerPhone: phoneNumber,
      hasCar: hasCar,
    };
    await onSave(updatedRide);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span />
      </DialogTrigger>

      <DialogContent className="w-full max-w-sm sm:max-w-xl bg-white m-1 max-h-[calc(100dvh-1rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Edit Ride</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Update the details of your ride listing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organizer">Organizer name</Label>
            <Input
              id="organizer"
              value={organizerName}
              readOnly
              placeholder={"Full name"}
              className="text-base"
            />
          </div>

          <div className="space-y-2 text-base">
            <CustomPhoneInput
              label="Phone Number"
              // required
              value={phoneNumber}
              onChange={setPhoneNumber}
              onErrorChange={setPhoneError}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={organizerEmail}
              readOnly
              placeholder={"Email"}
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
                value={formData.from}
                onChange={(e) =>
                  setFormData({ ...formData, from: e.target.value })
                }
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
                value={formData.to}
                onChange={(e) =>
                  setFormData({ ...formData, to: e.target.value })
                }
                required
                className="text-base"
              />
            </div>

            <div className="space-y-2 text-base">
              <TimeSelect
                label={
                  <>
                    Start time <span className="text-red-500">*</span>
                  </>
                }
                value={formData.startTime}
                onChange={(timeStr) =>
                  setFormData({ ...formData, startTime: timeStr })
                }
              />
            </div>

            <div className="space-y-2 text-base">
              <TimeSelect
                label={
                  <>
                    End time <span className="text-red-500">*</span>
                  </>
                }
                value={formData.endTime}
                onChange={(timeStr) =>
                  setFormData({ ...formData, endTime: timeStr })
                }
                startTime={formData.startTime}
                isEndTime={true}
              />
            </div>
          </div>

          <div className="space-y-2 text-base">
            <CustomSelect
              label={
                <>
                  Do you have your own car?{" "}
                  <span className="text-red-500">*</span>
                </>
              }
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No, I’d like to split with Uber/Lyft" },
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
              value={
                formData.additionalPassengers === 0
                  ? ""
                  : formData.additionalPassengers
              }
              onChange={(e) => {
                const val = e.target.value;
                setFormData({
                  ...formData,
                  additionalPassengers: val === "" ? 0 : parseInt(val),
                });
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
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="I have two suitcases, planning to order an UberXL..."
              rows={3}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={!ready}>
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
