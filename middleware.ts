import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // allow authentication or test utility apis
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/test-utils")) {
    return NextResponse.next();
  }

  // build CAS login url
  const intended = pathname + request.nextUrl.search;
  const loginUrl = new URL("/api/auth/cas-login", request.url);
  loginUrl.searchParams.set("redirect", intended);

  // try to get auth token
  const token = request.cookies.get("auth")?.value;

  // redirect to login page if no token
  if (!token) {
    // block unauthorized api access
    if (pathname.startsWith("/api/")) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }
    return NextResponse.redirect(loginUrl);
  }

  try {
    // verify token
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );
    if (!payload) throw new Error("Token verification Failed!");
    // allow request through
    return NextResponse.next();
  } catch {
    // block api with bad token
    if (pathname.startsWith("/api/")) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }
    // return other bad token holders to login page
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/feed/:path*",
    "/bookmarks/:path*",
    "/your-rides/:path*",
    "/api/:path*",
  ],
};
