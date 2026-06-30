// yideshare/app/your-rides/page.tsx

import { redirect } from "next/navigation";

import { findOwnedRides } from "@/lib/db";
import { getUserNetIdFromCookies } from "@/lib/cookies";

import YourRidesClient from "./YourRidesClient";

export default async function DashboardPage() {
  const netId = await getUserNetIdFromCookies();
  // if netid is null then redirect to CAS login, and if successful login, redirects back to your rides page
  if (!netId) {
    redirect(`/api/auth/cas-login?next=${encodeURIComponent("/your-rides")}`);
  }

  const ownedRides = await findOwnedRides(netId);

  return <YourRidesClient ownedRides={ownedRides} />;
}
