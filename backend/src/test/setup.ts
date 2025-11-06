import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Setup test database
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  // Clean up test data for MongoDB
  try {
    await prisma.user.deleteMany({});
    await prisma.bike.deleteMany({});
    await prisma.dock.deleteMany({});
    await prisma.reservation.deleteMany({});
    await prisma.ride.deleteMany({});
    await prisma.wallet.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.maintenanceTicket.deleteMany({});
    await prisma.pricingRule.deleteMany({});
  } catch (error) {
    console.log({ error });
  }
});