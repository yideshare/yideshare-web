import { getUserNetIdFromCookies } from "@/lib/cookies";
import MessagesClient from "./MessagesClient";

export default async function MessagesPage() {
  const netId = await getUserNetIdFromCookies();

  if (netId === null) {
    return <div>Please log in to view your messages.</div>;
  }

  return <MessagesClient />;
}
