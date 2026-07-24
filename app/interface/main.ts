import type { Message, User } from "@/prisma/generated/prisma/client";

export interface YaliesData {
  first_name: string;
  last_name: string;
  email: string;
}

export type AuthUser = Pick<
  User,
  "netId" | "name" | "email"
>;

export type ConversationSummary = {
  rideId: string;
  rideBeginning: string;
  rideDestination: string;
  peerNetId: string;
  peerName: string;
  lastPayload: string;
  lastTimestamp: string;
};

export type MessageItem = Pick<
  Message,
  "messageId" | "senderNetId" | "payload"
> & {
  timestamp: string;
};

