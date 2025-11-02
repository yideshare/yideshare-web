import logger from "./logger";
import { SignJWT } from "jose";

export async function validateCASTicket(
  ticket: string,
  serviceUrl: string
): Promise<string | null> {
  const validateUrl = `https://secure.its.yale.edu/cas/serviceValidate?ticket=${encodeURIComponent(
    ticket
  )}&service=${encodeURIComponent(serviceUrl)}`;

  const res = await fetch(validateUrl, { cache: "no-store" });
  if (!res.ok) return null;

  const text = await res.text();
  logger.info("CAS Validation - Response body length:", text.length);

  // Check for authentication success
  if (text.includes("<cas:authenticationSuccess>")) {
    // Extract netId from successful response
    const match = text.match(/<cas:user>(.*?)<\/cas:user>/);
    if (match) {
      logger.info("CAS Validation - Successfully extracted netId:", match[1]);
      return match[1];
    } else {
      logger.error("CAS Validation - No netId found in successful response");
      logger.error("CAS Validation - Response body:", text);
      return null;
    }
  } else if (text.includes("<cas:authenticationFailure>")) {
    // Extract error message from failure response
    const errorMatch = text.match(
      /<cas:authenticationFailure[^>]*>(.*?)<\/cas:authenticationFailure>/
    );
    const errorMessage = errorMatch
      ? errorMatch[1]
      : "Unknown authentication failure";
    logger.error("CAS Authentication Failed:", errorMessage);
    logger.error("CAS Validation - Response body:", text);
    return null;
  } else {
    logger.error("CAS Validation - Unexpected response format");
    logger.error("CAS Validation - Response body:", text);
    return null;
  }
}

export async function createJWT(
  firstName: string,
  lastName: string,
  email: string,
  netId: string
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