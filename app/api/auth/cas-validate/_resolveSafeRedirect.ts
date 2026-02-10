const ALLOWED_REDIRECT_PREFIXES = ["/feed", "/bookmarks", "/your-rides"];

/**
 * @internal
 * @private Only for use within /api/auth/cas-validate route.
 */
export function resolveSafeRedirect(
  requestSearchParams: URLSearchParams,
  baseUrl: string
): string {
  // Get redirect path from URL parameters
  const redirectPath = requestSearchParams.get("redirect");

  /*
    ?. operator indicates optional chaining.
    If the redirectPath is null or undefined,
    the expression evaluates to undefined,
    and the if condition fails.
  */
  if (!redirectPath?.startsWith("/")) {
    return `${baseUrl}/feed`;
  }

  const matchesPrefix = (prefix: string) =>
    redirectPath === prefix || redirectPath.startsWith(`${prefix}/`);

  return ALLOWED_REDIRECT_PREFIXES.some(matchesPrefix)
    ? new URL(redirectPath, baseUrl).toString()
    : `${baseUrl}/feed`;
}