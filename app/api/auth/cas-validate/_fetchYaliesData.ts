/**
 * YaliesData is declared as only having 3 fields: first name, last name, and email.
 * Yalies response includes more fields, but they are ignored (but still exist at runtime)
 */
import { YaliesData } from "@/app/interface/main";

export async function fetchYaliesData(
  netId: string
): Promise<YaliesData | undefined> {
  // Fetch from Yalies
  const response = await fetch("https://api.yalies.io/v2/people", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.YALIES_API_KEY}`,
    },
    // netid refers to query filter, netId refers to search string
    body: JSON.stringify({ query: "", filters: { netid: netId } }),
  });

  // NetId is unique, return first person if found
  const data = await response.json();
  return data.length > 0 ? data[0] : undefined;
}
