import { NextResponse } from "next/server";

import { CAS_URL, CAS_TEST_URL } from "@/lib/const";
import { getYideshareUrl } from "@/lib/parsers/url";

/* 
  This API endpoint redirects users to Yale CAS login 
  with the appropriate service URL and optional redirect parameter
*/
export async function GET(req: Request): Promise<NextResponse> {
  const casUrl = getCasUrl();
  const yideshareUrl = getYideshareUrl(req);
  const serviceParameter = `service=${encodeURIComponent(yideshareUrl)}`;

  // Preserve redirect search parameters from middleware requests
  // Destructive assingnment references searchParams property of URL class
  const { searchParams } = new URL(req.url);
  const redirectPath = searchParams.get("redirect") || "";
  const redirectParameter = redirectPath
    ? `?redirect=${encodeURIComponent(redirectPath)}`
    : "";

  const casLoginUrl = `${casUrl}/login?` + serviceParameter + redirectParameter;
  return NextResponse.redirect(casLoginUrl);
}

function getCasUrl(): string {
  return process.env.NODE_ENV === "production" ||
    process.env.NODE_ENV === "test"
    ? CAS_URL
    : CAS_TEST_URL;
}
