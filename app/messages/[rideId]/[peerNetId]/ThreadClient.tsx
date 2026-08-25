"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

import useSWR from "swr";
import { DateTime } from "luxon";

import { useToast } from "@/hooks/useToast";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import type { MessageItem } from "@/app/interface/main";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  return res.json();
};

interface ThreadClientProps {
  rideId: string;
  peerNetId: string;
  currentUserNetId: string;
}

export default function ThreadClient({ rideId, peerNetId, currentUserNetId }: ThreadClientProps) {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, error, isLoading, mutate } = useSWR<{ messages: MessageItem[] }>(
    `/api/messages/${rideId}/${peerNetId}`,
    fetcher,
    { refreshInterval: 3000 }
  );

  const messages = data?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend() {
    const payload = text.trim();
    if (!payload || sending) {
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`/api/messages/${rideId}/${peerNetId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload }),
      });
      if (!res.ok) {
        throw new Error("Bad API response");
      }
      setText("");
      await mutate();
    } catch (error) {
      console.error("Messaging: Failed to send message: ", error);
      toast({
        title: "Message not sent",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-white min-h-screen flex flex-col max-w-2xl mx-auto">
      <div className="px-6 py-4 border-b flex items-center gap-3">
        <Link href="/messages" className="text-sm text-muted-foreground hover:underline">
          ← Messages
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
        {isLoading && <p className="text-black">Loading…</p>}
        {error && <p className="text-red-500">Failed to load messages.</p>}

        {messages.map((m) => {
          const isOwn = m.senderNetId === currentUserNetId;
          return (
            <div key={m.messageId} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                  isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-black"
                }`}
              >
                <p>{m.payload}</p>
                <p className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {DateTime.fromISO(m.timestamp).toFormat("h:mm a")}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-6 py-4 border-t flex gap-2 items-end">
        <Textarea
          className="flex-1 resize-none"
          rows={2}
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button onClick={handleSend} disabled={sending || !text.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}
