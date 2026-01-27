// yideshare/components/top-bar.tsx
"use client";

import * as React from "react";
import { format } from "date-fns";
import { ChevronsUpDown } from "lucide-react";

// import debounce from "lodash.debounce";

import { encodeDate } from "@/lib/time";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { TimeSelect } from "@/components/ui/time-select";
import { LocationCombobox } from "@/components/search";
import { createStartEndDateTimes, isNextDay } from "@/lib/time";
import { ShareYideDialog } from "@/components/rides";
import { DateTime } from "luxon";

import { Ride } from "@prisma/client";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

/* -------------------------------------------------------------------------- */
/*  props                                                                     */
/* -------------------------------------------------------------------------- */

interface TopBarProps {
  /** callback used to push fresh results down to the feed list */
  onResults: (rides: Ride[]) => void;
  /** current rides in the feed */
  rides?: Ride[];
}

export function TopBar({ onResults, rides }: TopBarProps) {
  const { toast } = useToast();
  /* ----------------  form state  ---------------- */
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [date, setDate] = React.useState<Date | null>(null);
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");

  /* share‑a‑ride fields */
  const [open, setOpen] = React.useState(false);
  const [organizerName, setOrganizerName] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [useremail, setUseremail] = React.useState("");
  const [additionalPassengers, setAdditionalPassengers] = React.useState(3);
  const [description, setDescription] = React.useState("");
  const [hasCar, setHasCar] = React.useState(false);


  // New state to track if a search is active
  const [hasSearched, setHasSearched] = React.useState(false);

  const [errors, setErrors] = React.useState({
    //requires these fields
    fromError: "",
    toError: "",
    dateError: "",
    startTimeError: "",
    endTimeError: "",
    organizerNameError: "",
    phoneNumberError: "",
  });



  // Easter Egg
  function checkHarvardRedirect(destination: string): boolean {
    if (destination.trim().toLowerCase() === "harvard university") {
      window.location.href = "https://www.youtube.com/watch?v=bMM3z3o6BAs";
      return true;
    }
    return false;
  }

  const handleFindRide = async (e: React.FormEvent) => {
    e.preventDefault();

    if (checkHarvardRedirect(to)) return;

    const hasFrom = from.trim().length > 0;
    const hasTo = to.trim().length > 0;
    const hasDate = date !== null;
    const hasStart = startTime.trim().length > 0;
    const hasEnd = endTime.trim().length > 0;
    const hasTimeWindow = hasStart && hasEnd;

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
    if (hasDate && date) params.set("date", encodeDate(date));
    if (hasTimeWindow) {
      params.set("startTime", startTime);
      params.set("endTime", endTime);
    }

    const qs = params.toString();

    try {
      const res = await fetch(`/api/rides/search?${qs}`);
      if (!res.ok) throw new Error("Network error");
      const ridesResult: Ride[] = await res.json();
      onResults(ridesResult);
      setHasSearched(true);
    } catch (error) {
      console.error(error);
      onResults([]);
      setHasSearched(true);
    }
  };

  const handleClearSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.reload();
  };

  /* ----------------  share‑a‑ride -------------- */
  async function handleShareYide(e: React.FormEvent) {
    e.preventDefault();

    if (checkHarvardRedirect(to)) return;

    //temporary: until date in post rides popups, will alert user why they can't post a ride
    if (!date) {
      toast({
        title: "Select a date",
        description: "Please choose a date before posting a ride.",
        variant: "destructive",
      });
      return;
    }
    const selectedDate = date;
    const { startTimeObject, endTimeObject } = createStartEndDateTimes(
      selectedDate,
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
      hasCar: hasCar
    };

    try {
      const res = await fetch(`${API_BASE}/api/rides/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rideData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to post ride");
      }

      const newRide = await res.json();

      // Update the feed with the new ride
      if (rides) {
        onResults([newRide.ride, ...rides]);
      }

      // Reset form fields
      setFrom("");
      setTo("");
      setStartTime("");
      setEndTime("");
      setOrganizerName("");
      setPhoneNumber("");
      setAdditionalPassengers(0);
      setDescription("");
      setDate(null);
      setHasCar(false);

      // Show success toast
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

  /* ----------------  Mobile-Friendly UI  ---------------- */
  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl mb-4 sm:mb-8">
      {/* Mobile: Stack vertically, Desktop: Grid layout */}
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        <div className="space-y-1 sm:space-y-2">
          <label className="text-xs sm:text-sm font-bold text-black block">
            Leaving from
          </label>
          <LocationCombobox
            label=""
            placeholder="Select departure"
            value={from}
            onChange={setFrom}
            aria-label="Select departure location"
          />
        </div>

        <div className="space-y-1 sm:space-y-2">
          <label className="text-xs sm:text-sm font-bold text-black block">
            Going to
          </label>
          <LocationCombobox
            label=""
            placeholder="Select destination"
            value={to}
            onChange={setTo}
            aria-label="Select destination location"
          />
        </div>

        <div className="space-y-1 sm:space-y-2">
          <label className="text-xs sm:text-sm font-bold text-black block">
            Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="event-date"
                variant="outline"
                role="combobox"
                aria-label="Select departure date"
                className="justify-start text-left text-sm sm:text-base font-medium bg-transparent text-black w-full border-[#cde3dd] focus:ring-[#cde3dd] h-10"
              >
                {date ? (
                  <span className="truncate">
                    {format(date, "MMM d, yyyy")}
                  </span>
                ) : (
                  <span className="text-gray-500">Select date</span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date ?? undefined}
                disabled={(d) => {
                  const timeZone = "America/New_York";
                  const etDay = DateTime.fromObject(
                    {
                      year: d.getFullYear(),
                      month: d.getMonth() + 1,
                      day: d.getDate(),
                    },
                    { zone: timeZone }
                  ).startOf("day");
                  const etToday = DateTime.now()
                    .setZone(timeZone)
                    .startOf("day");
                  return etDay < etToday;
                }}
                onSelect={(selectedDate) => {
                  if (!selectedDate) return;
                  const timeZone = "America/New_York";
                  const etDay = DateTime.fromObject(
                    {
                      year: selectedDate.getFullYear(),
                      month: selectedDate.getMonth() + 1,
                      day: selectedDate.getDate(),
                    },
                    { zone: timeZone }
                  ).startOf("day");
                  const etToday = DateTime.now()
                    .setZone(timeZone)
                    .startOf("day");
                  if (etDay < etToday) {
                    toast({
                      title: "Invalid date",
                      description: "Please select today or a future date (ET).",
                      variant: "destructive",
                    });
                    return;
                  }
                  setDate(selectedDate);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1 sm:space-y-2">
          <label className="text-xs sm:text-sm font-bold text-black block">
            <span className="hidden sm:inline">Departure Time Range (EST)</span>
            <span className="sm:hidden">Time Range</span>
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="justify-start text-left text-sm sm:text-base font-medium bg-transparent text-black w-full border-[#cde3dd] focus:ring-[#cde3dd] h-10"
              >
                {startTime && endTime ? (
                  <span className="truncate">
                    {`${startTime} - ${endTime}`}
                    {isNextDay(startTime, endTime) && (
                      <span className="text-xs text-gray-500 ml-1">(+1)</span>
                    )}
                  </span>
                ) : (
                  <span className="text-gray-500">Select time</span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3 sm:p-4" align="start">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 min-w-[280px]">
                <div className="flex-1">
                  <TimeSelect
                    label="Earliest departure"
                    value={startTime}
                    onChange={setStartTime}
                    className="bg-transparent w-full border-[#cde3dd] focus:ring-[#cde3dd]"
                    aria-label="Select earliest departure time"
                  />
                </div>
                <div className="flex-1">
                  <TimeSelect
                    label="Latest departure"
                    value={endTime}
                    onChange={setEndTime}
                    startTime={startTime}
                    isEndTime={true}
                    className="bg-transparent w-full border-[#cde3dd] focus:ring-[#cde3dd]"
                    aria-label="Select latest departure time"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-center">
          {hasSearched ? (
            <>
              <Button
                className="bg-[#cde3dd] hover:bg-[#b8d4cc] text-[#397060] h-10 rounded-full text-sm sm:text-base font-medium flex-1 sm:flex-none sm:w-32"
                onClick={handleClearSearch}
              >
                Clear
              </Button>
              <Button
                className="bg-[#cde3dd] hover:bg-[#b8d4cc] text-[#397060] h-10 rounded-full text-sm sm:text-base font-medium flex-1 sm:flex-none sm:w-32"
                onClick={handleFindRide}
              >
                Search
              </Button>
              <Button
                className="bg-[#397060] hover:bg-[#2d5848] text-white h-10 rounded-full text-sm sm:text-base font-medium flex-1 sm:flex-none sm:w-32"
                onClick={() => setOpen(true)}
                // disabled={!date} optional
                title={!date ? "Select a date first" : undefined}
              >
                Post Ride
              </Button>
            </>
          ) : (
            <>
              <Button
                className="bg-[#cde3dd] hover:bg-[#b8d4cc] text-[#397060] h-10 rounded-full text-sm sm:text-base font-medium flex-1 sm:flex-none sm:w-32"
                onClick={handleFindRide}
              >
                Search
              </Button>
              <Button
                className="bg-[#397060] hover:bg-[#2d5848] text-white h-10 rounded-full text-sm sm:text-base font-medium flex-1 sm:flex-none sm:w-32"
                onClick={() => setOpen(true)}
                // disabled={!date} optional
                title={!date ? "Select a date first" : undefined}
              >
                Post Ride
              </Button>
            </>
          )}
        </div>
      </div>

      <ShareYideDialog
        open={open}
        setOpen={setOpen}
        /* sync with top‑bar fields */
        from={from}
        setFrom={setFrom}
        to={to}
        setTo={setTo}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        /* dialog‑specific */
        organizerName={organizerName}
        setOrganizerName={setOrganizerName}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        useremail={useremail}
        setUseremail={setUseremail}
        additionalPassengers={additionalPassengers}
        setAdditionalPassengers={setAdditionalPassengers}
        description={description}
        setDescription={setDescription}
        handleShareYide={handleShareYide}
        hasCar={hasCar}          
        setHasCar={setHasCar} 
      />
    </div>
  );
}
