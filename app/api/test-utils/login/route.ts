import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { createJWT } from "@/lib/auth";
import { ApiError, withApiErrorHandler } from "@/lib/apiErrorHandler";

import { getYideshareUrl } from "../../_url";

const TEST_USERS: Record<string, { firstName: string; lastName: string; email: string }> = {
  testuser:  { firstName: "Test",  lastName: "User",  email: "test.user@yale.edu" },
  testuser2: { firstName: "Test",  lastName: "User2", email: "test.user2@yale.edu" },
};

/**
 * For testing purposes only, forbidden in production!
 *
 * Handles GET test login requests.
 * Creates (or upserts) a test user in the database.
 * Sets an auth cookie for that user,
 * and redirects to `yideshareURL`/feed.
 */
async function testLoginHandler(req: Request): Promise<NextResponse> {
  if (process.env.NODE_ENV === "production") {
    throw new ApiError("Not allowed", 403);
  }

  const netId = new URL(req.url).searchParams.get("as") ?? "testuser";
  if (!TEST_USERS[netId]) throw new ApiError(`Unknown test user: ${netId}`, 400);

  const { firstName, lastName, email } = TEST_USERS[netId];

  const yideshareUrl = getYideshareUrl(req);
  const response = NextResponse.redirect(`${yideshareUrl}/feed`);

  await prisma.user.upsert({
    where: { netId },
    update: {},
    create: { netId, name: `${firstName} ${lastName}`, email },
  });

  const jwtSigned = await createJWT(firstName, lastName, email, netId);

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
