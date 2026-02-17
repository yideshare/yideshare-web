import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { createJWT } from "@/lib/auth";
import { ApiError, withApiErrorHandler } from "@/lib/infra";

import { getYideshareUrl } from "../_url";

/**
 * For testing purposes only, forbidden in production!
 * 
 * Handles GET test login requests.
 * Creates (or upserts) a test user in the database.
 * Sets an auth cookie for that user, 
 * and redirects to `yideshareURL`/feed.
 */
async function testLoginHandler(req: Request) {
  
  // Forbidden in production
  if (process.env.NODE_ENV === "production") {
    throw new ApiError("Not allowed", 403);
  }

  const yideshareUrl = getYideshareUrl(req);
  const response = NextResponse.redirect(`${yideshareUrl}/feed`);

  createTestUser();

  const jwtSigned = await createJWT(
    "Test",
    "User",
    "test.user@yale.edu",
    "testuser"
  );
  // Set authentication cookie
  response.cookies.set("auth", jwtSigned, {
    httpOnly: true,
    path: "/",
    secure: yideshareUrl.startsWith("https"),
    sameSite: "lax",
    /**
     * Make sure cookies and token expire at the same time for consistency;
     * maxAge set to 3600s = 1h to match the fallback JWT_EXPIRES_IN value
     */
    maxAge: 3600,
  });

  return response;
}

export const GET = withApiErrorHandler(testLoginHandler);

async function createTestUser() {
  await prisma.user.upsert({
    where: { netId: "testuser" },
    update: {},
    create: {
      netId: "testuser",
      name: "Test User",
      email: "test.user@yale.edu",
    },
  });
}
