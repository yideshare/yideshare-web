import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getUserNetIdFromCookies } from "@/lib/cookies";
import { withApiErrorHandler, ApiError } from "@/lib/apiErrorHandler";

import type { MessageItem } from "@/app/interface/main";

type ThreadContext = {
  params: Promise<{ rideId: string; peerNetId: string }>;
};

/**
 * Handles GET requests for a single thread.
 * Returns the latest 100 messages between the current user and the peer
 * for a ride, ordered oldest to newest.
 */
async function handleGetThread(
  _req: Request,
  { params }: ThreadContext,
): Promise<NextResponse> {
  const netId = await getUserNetIdFromCookies();
  if (!netId) {
    throw new ApiError("Unauthorized", 401);
  }

  const { rideId, peerNetId } = await params;

  const rows = await prisma.message.findMany({
    where: {
      rideId,
      OR: [
        { senderNetId: netId, receiverNetId: peerNetId },
        { senderNetId: peerNetId, receiverNetId: netId },
      ],
    },
    orderBy: { timestamp: "desc" },
    take: 100,
  });

  const messages: MessageItem[] = rows
    .slice()
    .reverse()
    .map((m) => ({
      messageId: m.messageId,
      senderNetId: m.senderNetId,
      payload: m.payload,
      timestamp: m.timestamp.toISOString(),
    }));

  return NextResponse.json({ messages });
}

/**
 * Handles POST requests to send a message.
 * Requires a non-empty payload and a thread anchored to the ride owner.
 */
async function handleSendMessage(
  req: Request,
  { params }: ThreadContext,
): Promise<NextResponse> {
  const netId = await getUserNetIdFromCookies();
  if (!netId) {
    throw new ApiError("Unauthorized", 401);
  }

  const { rideId, peerNetId } = await params;
  const body = await req.json().catch(() => ({}));
  const payload = String(body?.payload ?? "").trim();

  if (!payload) {
    throw new ApiError("payload is required", 400);
  }
  if (peerNetId === netId) {
    throw new ApiError("Cannot message yourself", 400);
  }

  const ride = await prisma.ride.findUnique({ where: { rideId } });
  if (!ride) {
    throw new ApiError("ride not found", 404);
  }

  // Every thread must be anchored to the ride owner
  if (netId !== ride.ownerNetId && peerNetId !== ride.ownerNetId) {
    throw new ApiError("Not authorized to message about this ride", 403);
  }

  const receiver = await prisma.user.findUnique({ where: { netId: peerNetId } });
  if (!receiver) {
    throw new ApiError("recipient not found", 404);
  }

  const message = await prisma.message.create({
    data: { senderNetId: netId, receiverNetId: peerNetId, rideId, payload },
  });

  return NextResponse.json({ message }, { status: 201 });
}

export const GET = withApiErrorHandler<ThreadContext>(handleGetThread);
export const POST = withApiErrorHandler<ThreadContext>(handleSendMessage);
