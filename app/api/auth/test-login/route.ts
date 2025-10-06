import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/withApiErrorHandler";
import { createJWT } from "@/lib/validate";

async function testLoginHandler(req: Request) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  if (process.env.NODE_ENV === "production") {
    throw new ApiError("Not allowed", 403);
  }

  //being hella hella cautious here
  if (process.env.DEV_TEST_LOGIN_ENABLED !== "true") {
    throw new ApiError("Not allowed", 404);
  }

  //restrict to localhost 
  if (process.env.DEV_TEST_LOGIN_LOCALHOST_ONLY === "true") {
    const host = req.headers.get("host")?.split(":")[0] || "";
    const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(host);
    if (!isLocal) throw new ApiError("Not allowed", 404);
  }

  const url = new URL(req.url);
  const provided = req.headers.get("x-dev-login-secret") || url.searchParams.get("token") || "";
  if (process.env.DEV_TEST_LOGIN_SECRET && provided !== process.env.DEV_TEST_LOGIN_SECRET) {
    throw new ApiError("Not allowed", 404);
  }

  await prisma.user.upsert({
    where: { netId: "testuser" },
    update: {},
    create: { netId: "testuser", name: "Test User", email: "test.user@yale.edu" },
  });

  const jwt_signed = await createJWT("Test", "User", "test.user@yale.edu", "testuser");

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
