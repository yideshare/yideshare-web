import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/infra";
import { createJWT } from "@/lib/auth";

async function testLoginHandler() {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  if (process.env.NODE_ENV === "production") {
    throw new ApiError("Not allowed", 403);
  }
  await prisma.user.upsert({
    where: { netId: "testuser" },
    update: {},
    create: {
      netId: "testuser",
      name: "Test User",
      email: "test.user@yale.edu",
    },
  });

  const response = NextResponse.redirect(`${baseUrl}/feed`);

  // set auth cookie
  const jwt_signed = await createJWT(
    "Test",
    "User",
    "test.user@yale.edu",
    "testuser",
  );

  response.cookies.set("auth", jwt_signed, {
    httpOnly: true,
    path: "/",
    secure: baseUrl.startsWith("https"),
    sameSite: "lax",
    // for the LOVE OF GOD PLEASE make sure this matches the expiry of the token
    // cookies and token go bad at the same time --> life easy :)
    // set for 1h to match the fallback JWT_EXPIRES_IN value
    maxAge: 60 * 60,
  });

  return response;
}

export async function GET() {
  return testLoginHandler();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
