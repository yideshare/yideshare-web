import { NextResponse } from "next/server";

import { withApiErrorHandler } from "@/lib/infra";

import { getYideshareUrl } from "../_url";

async function handleLogout(req: Request) {
  const yideshareUrl = getYideshareUrl(req);
  // Redirect to base by default; cannot destroy SSO session if not in production
  let response = NextResponse.redirect(yideshareUrl);

  if (process.env.NODE_ENV === "production") {
    const casLogoutUrl = `https://secure.its.yale.edu/cas/logout
      ?service=${encodeURIComponent(yideshareUrl)}`;
    // Use logout service to destroy SSO session
    response = NextResponse.redirect(casLogoutUrl);
  }

  response.cookies.delete("auth");
  return response;
}

export const GET = withApiErrorHandler(handleLogout);
