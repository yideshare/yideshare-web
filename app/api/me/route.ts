import { NextResponse } from "next/server";

import { getUserFromCookies } from "@/lib/cookies";
import { withApiErrorHandler, ApiError } from "@/lib/apiErrorHandler";

import type { AuthUser } from "@/app/interface/main";

/*
 * Returns the authenticated user's profile from the session cookie.
 * Used by the client to get the current user's netId, name, and email.
 */

async function handleGetUser(): Promise<NextResponse<AuthUser>> {
  const user: AuthUser | null = await getUserFromCookies();
  if (!user) {
    throw new ApiError("Not authenticated", 401);
  }

  return NextResponse.json(user);
}

export const GET = withApiErrorHandler(handleGetUser);
