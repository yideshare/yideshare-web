import { prisma } from "@/lib/db";
import { logger } from "@/lib/infra";
import { User } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function findOrCreateUser(
  netId: string,
  firstName: string,
  lastName: string,
  email: string,
): Promise<User> {
  // try to find user
  let user = await prisma.user.findUnique({ where: { netId } });

  // if user found
  if (user) {
    logger.info("DB USER: User found in the database:", user);
    // otherwise
  } else {
    user = await prisma.user.create({
      data: { netId, name: `${firstName} ${lastName}`, email },
    });
    logger.info("DB USER: New user added to the database:", user);
  }
  return user;
}

export async function getUserFromCookies(): Promise<{
  user?: { netId: string; name: string; email: string };
  error?: string;
  status?: number;
}> {
  // retrieve cookies
  const cookieStore = await cookies();
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
