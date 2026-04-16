import { DateTime } from "luxon";

import { TIME_ZONE } from "@/lib/const";

/**
 * Constructs start and end JS Date objects from a date and time strings.
 *
 * Parses the date and times in the application timezone and returns native
 * JS Date objects. If the end time is earlier than the start time, the end
 * datetime is advanced by one day to handle overnight intervals.
 *
 * @param date - The base date to combine with the time strings
 * @param startTime - Start time string in "h:mm a" format (e.g. "9:00 AM")
 * @param endTime - End time string in "h:mm a" format (e.g. "11:30 PM")
 * @returns An object containing `startTimeObject` and `endTimeObject` as JS Dates
 */
export function createStartEndDateTimes(
  date: Date,
  startTime: string,
  endTime: string
) {
  const dateStr = DateTime.fromJSDate(date).toFormat("yyyy-MM-dd");

  // Construct ET datetimes by combining the preserved date string with times
  const startDateTime = DateTime.fromFormat(
    `${dateStr} ${startTime}`,
    "yyyy-MM-dd h:mm a",
    { zone: TIME_ZONE }
  );

  let endDateTime = DateTime.fromFormat(
    `${dateStr} ${endTime}`,
    "yyyy-MM-dd h:mm a",
    { zone: TIME_ZONE }
  );

  if (endDateTime < startDateTime) {
    endDateTime = endDateTime.plus({ days: 1 });
  }

  return {
    startTimeObject: startDateTime.toJSDate(),
    endTimeObject: endDateTime.toJSDate(),
  };
}

/**
 * Determines whether an end time falls on the next day relative to a start time.
 *
 * Uses an arbitrary base date for comparison since only the time ordering matters.
 * Returns false if either time string is empty.
 *
 * @param startTime - Start time string in "h:mm a" format (e.g. "9:00 AM")
 * @param endTime - End time string in "h:mm a" format (e.g. "1:00 AM")
 * @returns True if the end time is earlier in the day than the start time
 */
export function isNextDay(startTime: string, endTime: string): boolean {
  if (!startTime || !endTime) return false;

  // arbitrary date used for time comparison only
  const baseDate = "2024-01-01";

  const startDateTime = DateTime.fromFormat(
    `${baseDate} ${startTime}`,
    "yyyy-MM-dd h:mm a",
    { zone: TIME_ZONE }
  );

  const endDateTime = DateTime.fromFormat(
    `${baseDate} ${endTime}`,
    "yyyy-MM-dd h:mm a",
    { zone: TIME_ZONE }
  );

  return endDateTime < startDateTime;
}
