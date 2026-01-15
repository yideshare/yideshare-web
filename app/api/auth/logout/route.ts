import { NextResponse } from "next/server";

function getBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function GET() {
  
  const baseUrl = getBaseUrl();

  if (process.env.NODE_ENV === "production")
  {

    // this will not redirect to base on localhost
    const casLogoutUrl = `https://secure.its.yale.edu/cas/logout?service=${encodeURIComponent(baseUrl)}`;
    const response = NextResponse.redirect(casLogoutUrl);

    // currently only storing auth cookies
    response.cookies.delete("auth");

    return response;
  } 
  else 
  {
    // just redirect to base, cannot gracefully destroy sso session
    const response = NextResponse.redirect(baseUrl);
    response.cookies.delete("auth");

    return response;
  }

  
  
}
