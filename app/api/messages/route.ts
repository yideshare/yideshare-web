import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getUserNetIdFromCookies } from "@/lib/cookies";
import { withApiErrorHandler, ApiError } from "@/lib/apiErrorHandler";

import type { ConversationSummary } from "@/app/interface/main";

/**
 * Handles GET requests for the current user's conversations.
 * Returns one summary per ride and peer pair, most recent first.
 */
async function handleGetConversations(): Promise<NextResponse> {
  const netId = await getUserNetIdFromCookies();
  if (!netId) {
    throw new ApiError("Unauthorized", 401);
  }

  const messages = await prisma.message.findMany({
    where: { OR: [{ senderNetId: netId }, { receiverNetId: netId }] },
    orderBy: { timestamp: "desc" },
    take: 400,
    include: {
      sender: { select: { name: true } },
      receiver: { select: { name: true } },
      ride: { select: { beginning: true, destination: true } },
    },
  });

  const seen = new Map<string, ConversationSummary>();
  for (const m of messages) {
    const isPeerSender = m.senderNetId !== netId;
    const peerNetId = isPeerSender ? m.senderNetId : m.receiverNetId;
    const peerName = isPeerSender ? m.sender.name : m.receiver.name;
    const key = `${m.rideId}::${peerNetId}`;
    if (!seen.has(key)) {
      seen.set(key, {
        rideId: m.rideId,
        rideBeginning: m.ride.beginning,
        rideDestination: m.ride.destination,
        peerNetId,
        peerName,
        lastPayload: m.payload,
        lastTimestamp: m.timestamp.toISOString(),
      });
    }
  }

  return NextResponse.json({ conversations: Array.from(seen.values()) });
}

export const GET = withApiErrorHandler(handleGetConversations);
