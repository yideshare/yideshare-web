"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronsUpDown } from "lucide-react";
import { DateTime } from "luxon";

import { TIME_ZONE } from "@/lib/const";
import { isNextDay } from "@/lib/time";
import { useToast } from "@/hooks/useToast";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { TimeSelect } from "@/components/ui/time-select";

import { LocationCombobox } from "./LocationCombobox";
import { ShareRideDialog } from "./ShareRideDialog";
import { useRideSearch } from "./_useRideSearch";

import type { Ride } from "@/prisma/generated/prisma/client";

// ------- TYPES -------

interface TopBarProps {
  // Callback used to push fresh results down to the feed list
  onResults: (rides: Ride[]) => void;
  // Current rides in the feed
  rides?: Ride[];
}

// ------- COMPONENT -------

export function TopBar({ onResults, rides }: TopBarProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const {
    from, setFrom,
    to, setTo,
    date, setDate,
    startTime, setStartTime,
    endTime, setEndTime,
    hasSearched,
    handleFindRide,
    handleClearSearch,
  } = useRideSearch(onResults);

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl mb-4 sm:mb-8">
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
                  <span className="truncate">{format(date, "MMM d, yyyy")}</span>
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
                  const etDay = DateTime.fromObject(
                    { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() },
                    { zone: TIME_ZONE }
                  ).startOf("day");
                  const etToday = DateTime.now().setZone(TIME_ZONE).startOf("day");
                  return etDay < etToday;
                }}
                onSelect={(selectedDate) => {
                  if (!selectedDate) return;
                  const etDay = DateTime.fromObject(
                    {
                      year: selectedDate.getFullYear(),
                      month: selectedDate.getMonth() + 1,
                      day: selectedDate.getDate(),
                    },
                    { zone: TIME_ZONE }
                  ).startOf("day");
                  const etToday = DateTime.now().setZone(TIME_ZONE).startOf("day");
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
                title={!date ? "Select a date first" : undefined}
              >
                Post Ride
              </Button>
            </>
          )}
        </div>
      </div>

      <ShareRideDialog
        open={open}
        setOpen={setOpen}
        from={from}
        setFrom={setFrom}
        to={to}
        setTo={setTo}
        date={date}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        rides={rides}
        onSuccess={onResults}
      />
    </div>
  );
}
