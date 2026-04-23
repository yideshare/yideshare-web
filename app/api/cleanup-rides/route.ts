import { NextResponse } from "next/server";
import { withApiErrorHandler } from "@/lib/infra"
import { closeExpiredRides } from "@/lib/db/cleanExpiredRides";

async function handler(request: Request) {
  // Vercel Cron Authorization header (CRON_SECRET)
  const authHeader = request.headers.get("authorization") ?? undefined;

  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    console.error("CRON: Unauthorized access attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Proceed with the cron job
  const result = await closeExpiredRides();
  return NextResponse.json({ success: true, ...result });
}

export const GET = withApiErrorHandler(handler);
