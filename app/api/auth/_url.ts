const CAS_URL = "https://secure-tst.its.yale.edu/cas";
const CAS_TEST_URL = "https://secure-tst.its.yale.edu/cas";

/**
 * @internal
 * @private Only for use within /api/auth/ route.
 */
export function getCasUrl(): string {
  return process.env.NODE_ENV === "production" ||
    process.env.NODE_ENV === "test"
    ? CAS_URL
    : CAS_TEST_URL;
}

/**
 * @internal
 * @private Only for use within /api/auth/ route.
 */
export function getYideshareUrl(req: Request): string {
  try {
    return new URL(req.url).origin;
  } catch {
    if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
  }
}
