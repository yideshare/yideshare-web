import { SignJWT } from "jose";

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

  const expiresIn = process.env.JWT_EXPIRES_IN ?? "1h";
  const key = new TextEncoder().encode(secret);

  const token = await new SignJWT({ firstName, lastName, email, netId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);

  return token;
}

export async function extractRideIdFromPayload(req: Request) {
  const body = await req.json();
  return body.rideId ? body.rideId : null;
}
