import { getUserFromCookies } from "@/lib/cookies";
import ThreadClient from "./ThreadClient";

interface ThreadPageProps {
  params: Promise<{ rideId: string; peerNetId: string }>;
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const [user, { rideId, peerNetId }] = await Promise.all([
    getUserFromCookies(),
    params,
  ]);

  if (!user) {
    return <div>Please log in to view this conversation.</div>;
  }

  return (
    <ThreadClient
      rideId={rideId}
      peerNetId={peerNetId}
      currentUserNetId={user.netId}
    />
  );
}
