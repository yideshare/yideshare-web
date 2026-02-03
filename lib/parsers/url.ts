import { searchParamsType } from "@/app/interface/main";
import { decodeDate } from "@/lib/parsers";

export function getYideshareUrl(req: Request): string {
  try {
    return new URL(req.url).origin;
  } catch {
    if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
  }
}

export function extractSearchParams(searchParams: searchParamsType) {
  const from = decodeURIComponent(searchParams.from);
  const to = decodeURIComponent(searchParams.to);
  const date = decodeDate(searchParams.date);
  const startTime = decodeURIComponent(searchParams.startTime);
  const endTime = decodeURIComponent(searchParams.endTime);

  return { from, to, date, startTime, endTime };
}
