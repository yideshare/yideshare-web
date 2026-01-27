import { searchParamsType } from "@/app/interface/main";
import { decodeDate } from "@/lib/parsers";

export function extractSearchParams(searchParams: searchParamsType) {
  const from = decodeURIComponent(searchParams.from);
  const to = decodeURIComponent(searchParams.to);
  const date = decodeDate(searchParams.date);
  const startTime = decodeURIComponent(searchParams.startTime);
  const endTime = decodeURIComponent(searchParams.endTime);

  return { from, to, date, startTime, endTime };
}
