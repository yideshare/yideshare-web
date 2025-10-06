import { NextResponse } from "next/server";
import crypto from "crypto";

// Temporary debug endpoint to verify the runtime value of DEV_TEST_LOGIN_SECRET
// DO NOT deploy to production; it auto-refuses in production just in case.
// Returns only metadata + a short hash prefix, never the raw secret.
export function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const secret = process.env.DEV_TEST_LOGIN_SECRET || "";
  const hashPrefix = secret
    ? crypto.createHash("sha256").update(secret).digest("hex").slice(0, 12)
    : null;

  return NextResponse.json({
    present: !!secret,
    length: secret.length,
    sha256Prefix: hashPrefix,
    nodeEnv: process.env.NODE_ENV,
  });
}

export const dynamic = "force-dynamic"; // ensure it isn't statically optimized
