import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const provided = request.headers.get("x-test-utils-secret") || "";
  const expected = process.env.PLAYWRIGHT_SECRET || "";
  if (expected) {
    if (provided !== expected) {
      return new NextResponse("Not allowed", { status: 403 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not allowed", { status: 403 });
  }
  // Clear tables
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
