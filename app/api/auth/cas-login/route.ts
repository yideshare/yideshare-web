import { NextResponse } from "next/server";

import { withApiErrorHandler } from "@/lib/infra";

import { encodeRedirectParam } from "../_parse";
import { getYideshareUrl, getCasUrl } from "../_url";

/* 
  This API endpoint redirects users to Yale CAS login 
  with yideshare service URL and an optional redirect parameter.
*/
async function handleCasLoginRedirect(req: Request): Promise<NextResponse> {
  const casUrl = getCasUrl();
  const yideshareUrl = getYideshareUrl(req);

  /*
    Preserve redirect search parameters from middleware.
    If user not authenticated, middleware sets a redirect parameter
    so they can return to the page they were trying to access.
   */
  const requestSearchParams = new URL(req.url).searchParams;
  const redirectParam = encodeRedirectParam(requestSearchParams);

  const casLoginUrl = `${casUrl}/login
    ?service=${encodeURIComponent(yideshareUrl)}
    ${redirectParam}`;

  return NextResponse.redirect(casLoginUrl);
}

export const GET = withApiErrorHandler(handleCasLoginRedirect);
