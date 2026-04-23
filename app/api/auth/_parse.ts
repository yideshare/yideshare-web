/**
 * @internal
 * @private Only for use within /api/auth/ route.
 */
export function encodeRedirectParam(
  requestSearchParams: URLSearchParams
): string | null {
  const redirectPath = requestSearchParams.get("redirect") || "";
  return redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : "";
}
