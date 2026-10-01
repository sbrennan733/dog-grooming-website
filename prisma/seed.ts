import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { services } from "../src/data/services";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function toPence(pounds: number): number {
  return Math.round(pounds * 100);
}

// Matches the placeholder hours already shown in the Footer. Admins can
// change these any time from /admin/availability.
const defaultWeeklyHours = [
  { dayOfWeek: "MONDAY", isClosed: false, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: "TUESDAY", isClosed: false, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: "WEDNESDAY", isClosed: false, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: "THURSDAY", isClosed: false, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: "FRIDAY", isClosed: false, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: "SATURDAY", isClosed: false, startTime: "09:00", endTime: "13:00" },
  { dayOfWeek: "SUNDAY", isClosed: true, startTime: null, endTime: null },
] as const;

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

  for (const day of defaultWeeklyHours) {
    await prisma.availabilityTemplate.upsert({
      where: { dayOfWeek: day.dayOfWeek },
      update: {},
      create: day,
    });
  }

  console.log(`Seeded ${defaultWeeklyHours.length} weekly availability rows.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
