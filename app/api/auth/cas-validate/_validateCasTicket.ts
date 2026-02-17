import { getCasUrl } from "../_url";

/**
 * @internal
 * @private Only for use within /api/auth/cas-validate route.
 */
export async function validateCasTicket(
  ticket: string,
  serviceUrl: string
): Promise<string | null> {
  const casUrl = getCasUrl();
  const validateUrl = `${casUrl}/serviceValidate
    ?ticket=${encodeURIComponent(ticket)}
    &service=${encodeURIComponent(serviceUrl)}`;

  // CAS tickets are single use, never chace the response
  const res = await fetch(validateUrl, { cache: "no-store" });
  if (!res.ok) {
    return null;
  }
  const text = await res.text();

  if (text.includes("<cas:authenticationSuccess>")) {
    // Extract netId from success response
    const netIdMatch = text.match(/<cas:user>(.*?)<\/cas:user>/);
    if (netIdMatch) {
      console.info(
        "CAS Validate: Successfully extracted netId:",
        netIdMatch[1]
      );
      return netIdMatch[1];
    } else {
      console.error("CAS Validate: No netId found in successful response");
    }
  } else if (text.includes("<cas:authenticationFailure>")) {
    // Extract error message from failure response
    const errorMatch = text.match(
      /<cas:authenticationFailure[^>]*>(.*?)<\/cas:authenticationFailure>/
    );
    const errorMessage = errorMatch
      ? errorMatch[1]
      : "Unknown authentication failure";
    console.error("CAS Validate: Authentication Failed:", errorMessage);
    // Fallback option if response is neither success nor failiure
  } else {
    console.error("CAS Validate: Unexpected response format");
  }

  console.error("CAS Validate: Response body:", text);
  return null;
}
