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
    const data = {
      description: service.description,
      duration: service.duration,
      priceSmall: toPence(service.prices.small),
      priceMedium: toPence(service.prices.medium),
      priceLarge: toPence(service.prices.large),
      isFromPrice: service.isFromPrice ?? false,
      priceNote: service.priceNote ?? null,
      deposit: toPence(service.deposit),
      isAssessment: service.isAssessment ?? false,
      isActive: true,
    };

    await prisma.service.upsert({
      where: { name: service.name },
      update: data,
      create: { name: service.name, ...data },
    });
  }

  // Services that are no longer on the list are retired rather than deleted,
  // so bookings made for them keep working.
  const retired = await prisma.service.updateMany({
    where: { name: { notIn: services.map((service) => service.name) } },
    data: { isActive: false },
  });

  console.log(
    `Seeded ${services.length} services (${retired.count} retired).`
  );

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
