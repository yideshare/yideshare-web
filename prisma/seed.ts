import { PrismaClient } from "@prisma/client";
import logger from "@/lib/logger";

const prisma = new PrismaClient();

async function main() {
  // Ensure user exists (create only if not found)
  let user = await prisma.user.findUnique({
    where: { netId: "test_netid" },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        netId: "test_netid",
        name: "Lena Qian",
        email: "lq1234@yale.edu"
      },
    });
  }

  // Create a ride associated with the existing user
  await prisma.ride.create({
    data: {
      owner: {
        connect: { netId: user.netId }, // Connect instead of create
      },
      ownerName: user.name,
      ownerEmail: user.email,
      ownerPhone: "123-456-7890",
      beginning: "Yale",
      destination: "Hartford",
      description: "Test ride",
      startTime: new Date(),
      endTime: new Date(),
      totalSeats: 4,
      currentTakenSeats: 0,
      isClosed: false,
      hasCar: false,
    },
  });
}

main()
  .catch((error) => {
    logger.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
