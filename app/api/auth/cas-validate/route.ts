import { NextResponse } from "next/server";

import { createJWT } from "@/lib/auth";
import { withApiErrorHandler, ApiError } from "@/lib/infra";

import { fetchYaliesData } from "./_fetchYaliesData";
import { resolveSafeRedirect } from "./_resolveSafeRedirect";
import { validateCasTicket } from "./_validateCasTicket";
import { encodeRedirectParam } from "../_parse";
import { getYideshareUrl } from "../_url";
import { findUserByNetId, createUser } from "./_user";

async function handleCasValidate(req: Request) {
  // Preserve redirect search parameters from middleware requests
  const requestSearchParams = new URL(req.url).searchParams;
  const redirectParam = encodeRedirectParam(requestSearchParams);
  const yideshareUrl = getYideshareUrl(req);
  const serviceURL = `${yideshareUrl}/api/auth/cas-validate${redirectParam}`;

  const ticket = requestSearchParams.get("ticket");

  if (!ticket) {
    throw new ApiError("CAS Validate: No CAS ticket provided", 400);
  }

  // Validate using the same service url used during login
  const netId = await validateCasTicket(ticket, serviceURL);
  if (!netId) {
    throw new ApiError("CAS Validate: Ticket validation failed", 400);
  }

  const yaliesData = await fetchYaliesData(netId);
  if (!yaliesData) {
    throw new ApiError(
      `CAS Validate: Yalies returned no data for netId ${netId}`,
      404
    );
  }

  const { first_name: firstName, last_name: lastName, email } = yaliesData;
  const user = await findUserByNetId(netId);
  if (!user) {
    await createUser(netId, firstName, lastName, email);
  }

  const redirectTo = resolveSafeRedirect(requestSearchParams, yideshareUrl);
  const successResponse = NextResponse.redirect(redirectTo);

  // Set authentication cookie
  const jwtSigned = await createJWT(firstName, lastName, email, netId);

  successResponse.cookies.set("auth", jwtSigned, {
    httpOnly: true, // Prevent client-side access
    path: "/",
    secure: yideshareUrl.startsWith("https"),
    sameSite: "lax",
    /*
      Make sure cookies and token expire at the same time for consistency;
      maxAge set for 1h to match the fallback JWT_EXPIRES_IN value
    */
  });

  console.info("CAS Validate: Successfully authenticated user:", netId);
  console.info("CAS Validate: Redirecting to:", redirectTo);
  return successResponse;
}

export const GET = withApiErrorHandler(handleCasValidate);
