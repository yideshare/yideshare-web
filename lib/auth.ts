import { SignJWT } from "jose";

/**
 * Creates a signed JWT for an authenticated user.
 *
 * Encodes the user's identity claims and sets a 1-hour expiration.
 * Uses HS256 signing with the JWT_SECRET environment variable.
 *
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @param email - User's email address
 * @param netId - User's NetID
 * @returns A signed JWT string
 * @throws Error if JWT_SECRET is not set in the environment
 */
export async function createJWT(
  firstName: string,
  lastName: string,
  email: string,
  netId: string,
): Promise<string> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const key = new TextEncoder().encode(secret);

  const token = await new SignJWT({ firstName, lastName, email, netId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);

  return token;
}
