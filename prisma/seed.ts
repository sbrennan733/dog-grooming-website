import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { services } from "../src/data/services";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function toPence(pounds: number): number {
  return Math.round(pounds * 100);
}

async function main() {
  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: {
        description: service.description,
        duration: service.duration,
        price: toPence(service.price),
        deposit: toPence(service.deposit),
        isAssessment: service.name === "Assessment Visit",
      },
      create: {
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: toPence(service.price),
        deposit: toPence(service.deposit),
        isAssessment: service.name === "Assessment Visit",
      },
    });
  }

  console.log(`Seeded ${services.length} services.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
