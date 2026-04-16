import { prisma } from "@/lib/db";

import type { User } from "@/prisma/generated/prisma/client";

/**
 * @internal
 * @private Only for use within /api/auth/cas-validate route.
 */
export async function findUserByNetId(netId: string): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { netId } });

  if (user) {
    console.log("DB: User found in database:", user);
    return user;
  }

  return null;
}

/**
 * @internal
 * @private Only for use within /api/auth/cas-validate route.
 */
export async function createUser(
  netId: string,
  firstName: string,
  lastName: string,
  email: string,
): Promise<void> {
  const user = await prisma.user.create({
    data: { netId, name: `${firstName} ${lastName}`, email },
  });
  console.log("DB: New user added to database:", user);
}
