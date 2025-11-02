import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { jwtVerify } from "jose";
import logger from "@/lib/logger";
import { createHmac } from "node:crypto";

export async function findOrCreateUser(
  netId: string,
  firstName: string,
  lastName: string,
  email: string
) {
  // try to find user
  let user = await prisma.user.findUnique({ where: { netId } });

  // if user found
  if (user) {
    logger.info("DB USER: User found in the database:", user);
    // otherwise
  } else {
    user = await prisma.user.create({
      data: { netId, name: `${firstName} ${lastName}`, email },
    });
    logger.info("DB USER: New user added to the database:", user);
  }
  return user;
}

export function getUserFromCookies(cookieStore: ReadonlyRequestCookies) {
  // retrieve cookies
  const userCookie = cookieStore.get("user");

  // if no user cookie
  if (!userCookie) {
    return {
      error: "Cannot fetch cookies, user not authenticated",
      status: 401,
    };
  }

  try {
    // parse user data into an object
    const parsedUser = JSON.parse(userCookie.value);
    return { user: parsedUser };
  } catch {
    return { error: "Invalid cookie format", status: 400 };
  }
}

// chat helped here, check
export async function getUserNetIdFromCookies() {

  // retrieve cookies
  const cookieStore = await cookies();
  // parse value
  const token = cookieStore.get("auth")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
    return (payload as any).netId ?? null;
  } catch {
    return null;
  }
}
/**
 * Verify the signed "user" cookie using HMAC and return the parsed user object on success.
 * Expects two cookies:
 *  - user: JSON string containing at least { netId: string }
 *  - user_sig: hex HMAC-SHA256 signature of the raw user cookie value
 */
export function getVerifiedUserFromCookieStore(
  cookieStore: ReadonlyRequestCookies
): {
  firstName?: string;
  lastName?: string;
  email?: string;
  netId: string;
} | null {
  const userCookie = cookieStore.get("user");
  const sigCookie = cookieStore.get("user_sig");
  if (!userCookie || !sigCookie) return null;

  const raw = userCookie.value; // raw (not JSON-parsed) value
  const secret = process.env.COOKIE_SECRET || "dev-cookie-secret";
  try {
    const expected = createHmac("sha256", secret).update(raw).digest("hex");
    if (expected !== sigCookie.value) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.netId || typeof parsed.netId !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}
export async function getVerifiedUserNetIdFromCookies(): Promise<
  string | null
> {
  const store = await cookies();
  const user = getVerifiedUserFromCookieStore(
    store as unknown as ReadonlyRequestCookies
  );
  return user?.netId ?? null;
}
export function getVerifiedUserNetIdFromRequest(req: Request): string | null {
  const header = req.headers.get("cookie") || "";
  if (!header) return null;
  const jar = Object.fromEntries(
    header
      .split(/;\s*/)
      .filter(Boolean)
      .map((p) => {
        const idx = p.indexOf("=");
        if (idx === -1) return [p, ""] as const;
        return [p.substring(0, idx), p.substring(idx + 1)] as const;
      })
  );
  const userRaw = jar["user"];
  const sig = jar["user_sig"];
  if (!userRaw || !sig) return null;
  try {
    const decoded = decodeURIComponent(userRaw);
    const secret = process.env.COOKIE_SECRET || "dev-cookie-secret";
    const expected = createHmac("sha256", secret).update(decoded).digest("hex");
    if (expected !== sig) return null;
    const parsed = JSON.parse(decoded);
    return typeof parsed?.netId === "string" ? parsed.netId : null;
  } catch {
    return null;
  }
}
