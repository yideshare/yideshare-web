import { NextResponse } from "next/server";

import { withApiErrorHandler } from "@/lib/infra";

import { encodeRedirectParam } from "../_parse";
import { getYideshareUrl, getCasUrl } from "../_url";

/**
 * Handles GET login requests.
 * Redirects users to Yale CAS login with yideshare service URL
 * and an optional redirect parameter.
 */
async function handleCasLoginRedirect(req: Request): Promise<NextResponse> {
  const casUrl = getCasUrl();
  const yideshareUrl = getYideshareUrl(req);

  /**
   * Preserve redirect search parameters from middleware.
   * If user not authenticated, middleware sets a redirect parameter
   * so they can return to the page they were trying to access.
   */
  const requestSearchParams = new URL(req.url).searchParams;
  const redirectParam = encodeRedirectParam(requestSearchParams);
  const serviceUrl = `${yideshareUrl}/api/auth/cas-validate${redirectParam}`;
  const casLoginUrl = `${casUrl}/login?service=${encodeURIComponent(serviceUrl)}`;

  return NextResponse.redirect(casLoginUrl);
}

export const GET = withApiErrorHandler(handleCasLoginRedirect);
