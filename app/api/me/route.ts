// app/api/me/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/db/user";

export async function GET() {
  const cookieStore = await cookies();
  const { user, error, status } = await getUserFromCookies(cookieStore);
  if (error || !user) {
    console.warn("GET /api/me failed:", { error, status });
    return NextResponse.json({ error }, { status: status ?? 401 });
  }

  return NextResponse.json(user); // { netId, name, email }
}