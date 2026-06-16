import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import type { AuthUser } from "@/app/interface/main";

/**
 * Parses and validates the "auth" cookie, returning an authenticated user.
 *
 * @for API routes
 * @returns The authenticated {@link AuthUser} or null if user retrieval fails.
 */
export async function getUserFromCookies(): Promise<AuthUser | null> {
  const cookieStore = await cookies();

  const userCookie = cookieStore.get("auth");
  if (!userCookie) {
    console.error("DB User: No user authenticated");
    return null;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("DB User: JWT_SECRET missing from .env file");
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      userCookie.value,
      new TextEncoder().encode(secret)
    );

    const netId: string = (payload as any).netId ?? "";
    const firstName: string = (payload as any).firstName ?? "";
    const lastName: string = (payload as any).lastName ?? "";
    const email: string = (payload as any).email ?? "";

    return { netId, name: `${firstName} ${lastName}`.trim(), email };
  } catch {
    console.error("DB User: Invalid auth cookie or JWT token");
    return null;
  }
}

/**
 * Convenience wrapper around {@link getUserFromCookies} that resolves the cookie
 * store automatically and returns only the user's netId.
 *
 * Prefer {@link getUserFromCookies} when you need the full user object, to avoid
 * fetching and discarding the other fields.
 *
 * @returns The authenticated user's netId or null if user was not found.
 */
export async function getUserNetIdFromCookies(): Promise<string | null> {
  const user = await getUserFromCookies();
  return user?.netId ?? null;
}
