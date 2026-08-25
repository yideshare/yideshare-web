"use client";

import Link from "next/link";

import useSWR from "swr";
import { DateTime } from "luxon";

import type { ConversationSummary } from "@/app/interface/main";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  return res.json();
};

export default function MessagesClient() {
  const { data, error, isLoading } = useSWR<{ conversations: ConversationSummary[] }>(
    "/api/messages",
    fetcher,
    { refreshInterval: 5000 }
  );

  if (isLoading) {
    return <p className="p-6 text-black">Loading conversations…</p>;
  }
  if (error) {
    return <p className="p-6 text-red-500">Failed to load messages.</p>;
  }

  const conversations = data?.conversations ?? [];

  return (
    <div className="bg-white min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-black mb-6">Messages</h1>

      {conversations.length === 0 ? (
        <p className="text-black">No conversations yet. Message a ride owner from the Feed.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {conversations.map((c) => (
            <li key={`${c.rideId}::${c.peerNetId}`}>
              <Link
                href={`/messages/${c.rideId}/${c.peerNetId}`}
                className="block rounded-2xl border border-border bg-white px-5 py-4 shadow-card hover:shadow-cardHover"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-black">{c.peerName}</span>
                  <span className="text-xs text-muted-foreground">
                    {DateTime.fromISO(c.lastTimestamp).toRelative()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {c.rideBeginning} → {c.rideDestination}
                </p>
                <p className="text-sm text-black truncate">{c.lastPayload}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
