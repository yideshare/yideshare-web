import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { withApiErrorHandler, ApiError } from "@/lib/apiErrorHandler";

/*
 * Resets the database to a clean state with a single test user.
 * Only available in non-production environments.
 */

async function handleResetDb(): Promise<NextResponse> {
  if (process.env.NODE_ENV === "production") {
    throw new ApiError("Not allowed", 403);
  }

  await prisma.message.deleteMany({});
  await prisma.rideRequest.deleteMany({});
  await prisma.rideParticipant.deleteMany({});
  await prisma.bookmark.deleteMany({});
  await prisma.ride.deleteMany({});
  await prisma.user.deleteMany({});

  await prisma.user.create({
    data: {
      netId: "testuser",
      name: "Test User",
      email: "test.user@yale.edu",
    },
  });

  return NextResponse.json({ ok: true });
}

export const POST = withApiErrorHandler(handleResetDb);
