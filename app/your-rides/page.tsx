// yideshare/app/your-rides/page.tsx

import { findOwnedRides } from "@/lib/db";
import { getUserNetIdFromCookies } from "@/lib/cookies";

import YourRidesClient from "./YourRidesClient";

export default async function DashboardPage() {
  const netId = await getUserNetIdFromCookies();

  if (netId === null) {
    return <div>Please log in to view your rides.</div>;
  }

  const ownedRides = await findOwnedRides(netId);

  return <YourRidesClient ownedRides={ownedRides} currentUserNetId={netId} />;
}
