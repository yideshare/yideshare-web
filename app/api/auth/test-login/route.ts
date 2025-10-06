import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createJWT } from "@/lib/validate";
import crypto from "crypto";

function getOrigin(req: Request) {
  try {
    return new URL(req.url).origin;
  } catch {
    return process.env.NEXTAUTH_URL || "http://localhost:3000";
  }
}

async function testLoginHandler(req: Request) {
  const baseUrl = getOrigin(req);
  if ((process.env.NODE_ENV as string) !== "production") {
    console.log("[test-login] start", { baseUrl });
  }
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "blocked in production" },
      { status: 403 }
    );
  }

  //being hella hella cautious here
  if (process.env.DEV_TEST_LOGIN_ENABLED !== "true") {
    return NextResponse.json(
      { error: "DEV_TEST_LOGIN_ENABLED not true" },
      { status: 404 }
    );
  }

  //restrict to localhost
  if (process.env.DEV_TEST_LOGIN_LOCALHOST_ONLY === "true") {
    const host = req.headers.get("host")?.split(":")[0] || "";
    const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(host);
    if (!isLocal)
      return NextResponse.json(
        { error: "host not allowed", host },
        { status: 404 }
      );
  }

  const url = new URL(req.url);
  const provided =
    req.headers.get("x-dev-login-secret") ||
    url.searchParams.get("token") ||
    "";
  if (!process.env.DEV_TEST_LOGIN_SECRET) {
    return NextResponse.json(
      { error: "DEV_TEST_LOGIN_SECRET not set" },
      { status: 404 }
    );
  }
  if (provided !== process.env.DEV_TEST_LOGIN_SECRET) {
    const exp = process.env.DEV_TEST_LOGIN_SECRET;
    const mismatch = {
      providedLength: provided.length,
      expectedLength: exp.length,
      providedSha256Prefix: provided
        ? crypto.createHash("sha256").update(provided).digest("hex").slice(0, 8)
        : null,
      expectedSha256Prefix: crypto
        .createHash("sha256")
        .update(exp)
        .digest("hex")
        .slice(0, 8),
      hasTrailingSpaceProvided: /\s$/.test(provided),
      hasTrailingSpaceExpected: /\s$/.test(exp),
      hasLeadingSpaceProvided: /^\s/.test(provided),
      hasLeadingSpaceExpected: /^\s/.test(exp),
    };
    if ((process.env.NODE_ENV as string) !== "production") {
      console.warn("[test-login] secret mismatch", mismatch);
    }
    return NextResponse.json(
      { error: "secret mismatch", details: mismatch },
      { status: 404 }
    );
  }

  try {
    await prisma.user.upsert({
      where: { netId: "testuser" },
      update: {},
      create: {
        netId: "testuser",
        name: "Test User",
        email: "test.user@yale.edu",
      },
    });
  } catch (e: any) {
    if ((process.env.NODE_ENV as string) !== "production") {
      console.error("[test-login] prisma upsert failed", e);
    }
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  let jwt_signed: string;
  try {
    jwt_signed = await createJWT(
      "Test",
      "User",
      "test.user@yale.edu",
      "testuser"
    );
  } catch (e: any) {
    if ((process.env.NODE_ENV as string) !== "production") {
      console.error("[test-login] createJWT failed", e);
    }
    return NextResponse.json({ error: "JWT error" }, { status: 500 });
  }

  const redirectTo = `${baseUrl}/feed`;
  const successResponse = NextResponse.redirect(redirectTo);

  successResponse.cookies.set("auth", jwt_signed, {
    httpOnly: true,
    path: "/",
    secure: baseUrl.startsWith("https"),
    sameSite: "lax",
    maxAge: 60 * 60,
  });

  return successResponse;
}

export async function GET(req: Request) {
  return testLoginHandler(req);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

console.log("[test-login] env snapshot", {
  enabled: process.env.DEV_TEST_LOGIN_ENABLED,
  hasSecret: !!process.env.DEV_TEST_LOGIN_SECRET,
  secretLen: process.env.DEV_TEST_LOGIN_SECRET?.length,
  jwtLen: process.env.JWT_SECRET?.length,
});
