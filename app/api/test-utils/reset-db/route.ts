import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  // don't allow reset of DB in production ever
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not allowed", { status: 403 });
  }
  // Clear tables
  await prisma.message.deleteMany({});
  await prisma.rideRequest.deleteMany({});
  await prisma.rideParticipant.deleteMany({});
  await prisma.bookmark.deleteMany({});
  await prisma.ride.deleteMany({});
  await prisma.user.deleteMany({});

  // test user creation after db clearing
  await prisma.user.create({
    data: {
      netId: "testuser",
      name: "Test User",
      email: "test.user@yale.edu",
    },
  });

  // success
  return NextResponse.json({ ok: true });
}
