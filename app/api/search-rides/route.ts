import { NextResponse } from "next/server";
import { findFilteredRides } from "@/lib/ride";
import { createStartEndDateTimes, decodeDate } from "@/lib/time";
import { withApiErrorHandler } from "@/lib/withApiErrorHandler";
import { DateTime } from "luxon";

async function getHandler(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const from = (searchParams.get("from") || "").trim();
  const to = (searchParams.get("to") || "").trim();
  const dateRaw = searchParams.get("date");
  const startTime = (searchParams.get("startTime") || "").trim();
  const endTime = (searchParams.get("endTime") || "").trim();

  const hasFrom = from.length > 0;
  const hasTo = to.length > 0;
  const hasStart = startTime.length > 0;
  const hasEnd = endTime.length > 0;
  const hasTimeWindow = hasStart && hasEnd;
  const dateObject = dateRaw ? decodeDate(dateRaw) : null;
  const hasDate = !!dateObject;

  // crude and silly no filter check if someone just tried fetching all
  // if we are confident in our protection this can be removed | wdym by protection? (rock eyebrow raise)
  const noFilters = !hasFrom && !hasTo && !hasDate && !hasStart && !hasEnd;
  if (noFilters) {
    return NextResponse.json([]);
  }

  let filterStartTime: Date | null = null;
  let filterEndTime: Date | null = null;

  if (hasTimeWindow && hasDate && dateObject) {
    //Case: has time window and date
    const { startTimeObject, endTimeObject } = createStartEndDateTimes(
      dateObject,
      startTime,
      endTime
    );
    filterStartTime = startTimeObject;
    filterEndTime = endTimeObject;
  } else if (hasDate && dateObject) {
    //Case: has date only
    const timeZone = "America/New_York";
    const startOfDay = DateTime.fromJSDate(dateObject)
      .setZone(timeZone)
      .startOf("day")
      .toJSDate();
    const endOfDay = DateTime.fromJSDate(dateObject)
      .setZone(timeZone)
      .endOf("day")
      .toJSDate();
    filterStartTime = startOfDay;
    filterEndTime = endOfDay;
  }

  let rides = await findFilteredRides(from, to, filterStartTime, filterEndTime);

  //Case: has time window only
  if (hasTimeWindow && !hasDate) {
    const timeZone = "America/New_York";

    const toMinutes = (dt: Date) => {
      const d = DateTime.fromJSDate(dt).setZone(timeZone);
      return d.hour * 60 + d.minute;
    };
    const parseTimeToMinutes = (t: string) => {
      const dt = DateTime.fromFormat(t, "h:mm a", { zone: timeZone });
      return dt.hour * 60 + dt.minute;
    };
    const splitInterval = (s: number, e: number): Array<[number, number]> => {
      // Returns 1 or 2 non-wrapping intervals within [0,1440).
      // Note: if e === s, the interval represents a single point in time and is handled separately below.
      if (e > s) return [[s, e]];
      return [
        [s, 1440],
        [0, e],
      ];
    };
    const intervalsOverlap = (
      a: Array<[number, number]>,
      b: Array<[number, number]>
    ) =>
      a.some(([as, ae]) =>
        b.some(([bs, be]) => Math.min(ae, be) > Math.max(as, bs))
      );

    const reqStartMin = parseTimeToMinutes(startTime);
    const reqEndMin = parseTimeToMinutes(endTime);
    if (reqStartMin === reqEndMin) {
      rides = rides.filter((ride: any) => {
        const rs = toMinutes(ride.startTime);
        const re = toMinutes(ride.endTime);
        if (re > rs) {
          return reqStartMin >= rs && reqStartMin <= re;
        }
        return reqStartMin >= rs || reqStartMin <= re;
      });
    } else {
      const reqSegs = splitInterval(reqStartMin, reqEndMin);
      rides = rides.filter((ride: any) => {
        const rs = toMinutes(ride.startTime);
        const re = toMinutes(ride.endTime);
        const rideSegs = splitInterval(rs, re);
        return intervalsOverlap(reqSegs, rideSegs);
      });
    }
  }

  return NextResponse.json(rides);
}

export const GET = withApiErrorHandler(getHandler);
