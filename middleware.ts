import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // if authing the guy, let him though
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // try to get user cookie
  const token = request.cookies.get("auth")?.value;

  // allow API calls with x-user-netid when not prod
  if (process.env.NODE_ENV !== "production") {
    const devNetId = request.headers.get("x-user-netid");
    if (devNetId && pathname.startsWith("/api/")) {
      return NextResponse.next();
    }
  }

  // build CAS login url
  const intended = pathname + request.nextUrl.search;
  const loginUrl = new URL("/api/auth/cas-login", request.url);
  loginUrl.searchParams.set("redirect", intended);

  // if they dont have the token we dont want them
  if (!token) {
    // if youre an api we only see you as a friend
    if (pathname.startsWith("/api/")) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }
    return NextResponse.redirect(loginUrl);
  }

  try {
    // bang your environment vars | var! asserts var != NULL
    // might come back to bite you but we were never smart
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );
    if (!payload) throw new Error("invalid token payload");
    return NextResponse.next();
  } catch {
    if (pathname.startsWith("/api/")) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }
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
