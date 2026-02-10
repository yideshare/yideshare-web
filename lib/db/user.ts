import { cookies } from "next/headers";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { jwtVerify } from "jose";



export async function getUserFromCookies(cookieStore: ReadonlyRequestCookies) {
  // retrieve cookies
  // 11/06 by Tracy: update due to Cookies are JWT instead of JSON
  // const userCookie = cookieStore.get("user");
  const userCookie = cookieStore.get("auth");
  
  // if no user cookie
  if (!userCookie) return {error: "Cannot fetch cookies, user not authenticated",status: 401};

  const secret = process.env.JWT_SECRET;
  if (!secret) return { error: "Server misconfigured: JWT_SECRET missing", status: 500 };

  const token = userCookie.value;
  const looksLikeJWT = token.startsWith("eyJ");
  try {
    if (looksLikeJWT){
      const { payload } = await jwtVerify(token,new TextEncoder().encode(process.env.JWT_SECRET!));
      // verify the JWT-cookie
      const netId = (payload as any).netId ?? "";
      const firstName = (payload as any).firstName ?? "";
      const lastName = (payload as any).lastName ?? "";
      const name = `${firstName} ${lastName}`.trim();
      const email = (payload as any).email ?? "";
      return { user: { netId, name, email } };
    }
    // if not JWT, the original JSON cookie
    const parsedUser = JSON.parse(token);
    return { user: parsedUser };
  } catch {
    return { error: "Invalid Cookie/ JWT token", status: 401 };
  }

}

// chat helped here, check
export async function getUserNetIdFromCookies() {
  // retrieve cookies
  const cookieStore = await cookies();
  // parse value
  const token = cookieStore.get("auth")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!),
    );
    return (payload as any).netId ?? null;
  } catch {
    return null;
  }
}
