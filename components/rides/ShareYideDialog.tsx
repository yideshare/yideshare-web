// yideshare/components/ShareYideDialog.tsx
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
import { CustomPhoneInput } from "@/components/ui/phone-input";

/* -------------------------------------------------------------------------- */
/*  props                                                                     */
/* -------------------------------------------------------------------------- */
interface ShareYideDialogProps {
  open: boolean;
  setOpen: (v: boolean) => void;

  /* data already present in the top bar – keep them in sync */
  from: string;
  setFrom: (v: string) => void;
  to: string;
  setTo: (v: string) => void;
  startTime: string;
  setStartTime: (v: string) => void;
  endTime: string;
  setEndTime: (v: string) => void;

  /* dialog‑only fields */
  organizerName: string;
  setOrganizerName: (v: string) => void;
  phoneNumber: string;
  setPhoneNumber: (v: string) => void;
  // phoneNumberError?: string;
  additionalPassengers: number;
  setAdditionalPassengers: (v: number) => void;
  description: string;
  setDescription: (v: string) => void;

  handleShareYide: (e: React.FormEvent) => Promise<void>;
}

export function ShareYideDialog({
  open,
  setOpen,
  from,
  setFrom,
  to,
  setTo,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  organizerName,
  setOrganizerName,
  phoneNumber,
  setPhoneNumber,
  additionalPassengers,
  setAdditionalPassengers,
  description,
  setDescription,
  handleShareYide,
}: ShareYideDialogProps) {
  const [phoneError, setPhoneError] = React.useState<string | undefined>(
    undefined
  );

  const ready =
    from && to && startTime && endTime && !phoneError && organizerName; //in future, can add more checks
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span />
      </DialogTrigger>

      <DialogContent
        className="w-full max-w-sm sm:max-w-xl bg-white m-1 max-h-[calc(100dvh-1rem)] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Share a Ride</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Fill out the details below to create a new ride listing.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            handleShareYide(e);
            setOpen(false);
          }}
          className="space-y-2 sm:space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="organizer">
              Organizer name <span className="text-red-500">*</span>{" "}
            </Label>
            <Input
              id="organizer"
              value={organizerName}
              onChange={(e) => setOrganizerName(e.target.value)}
              placeholder="John Doe"
              required
              className="text-base"
            />
          </div>

          <div className="space-y-2 text-base">
            <CustomPhoneInput
              label="Phone Number"
              required
              value={phoneNumber}
              onChange={setPhoneNumber}
              onErrorChange={setPhoneError}
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
