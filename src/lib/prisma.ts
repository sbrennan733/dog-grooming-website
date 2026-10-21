import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// The local development database (`prisma dev`) only accepts about three
// connections at once and drops the rest, so keep the pool small there and
// let extra queries wait for a free connection. A real Postgres server can
// handle more.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: process.env.NODE_ENV === "production" ? 10 : 2,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
