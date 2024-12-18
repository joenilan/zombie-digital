import { beforeAll, afterAll } from "bun:test";
import { prisma } from "@/lib/prisma";

beforeAll(async () => {
  // Setup test database or any other test requirements
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});
