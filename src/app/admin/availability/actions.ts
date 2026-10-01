"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { DayOfWeek } from "@/generated/prisma/client";

const DAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export async function updateWeeklyAvailability(formData: FormData) {
  // Defense in depth: verify the admin role here too, not just at the
  // route level, per Next's own auth guidance ("always verify
  // authentication/authorization inside each Server Action").
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    redirect("/login");
  }

  for (const day of DAYS) {
    const isClosed = formData.get(`${day}-closed`) === "on";
    const startTime = formData.get(`${day}-start`) as string;
    const endTime = formData.get(`${day}-end`) as string;

    await prisma.availabilityTemplate.upsert({
      where: { dayOfWeek: day },
      update: {
        isClosed,
        startTime: isClosed ? null : startTime,
        endTime: isClosed ? null : endTime,
      },
      create: {
        dayOfWeek: day,
        isClosed,
        startTime: isClosed ? null : startTime,
        endTime: isClosed ? null : endTime,
      },
    });
  }

  revalidatePath("/admin/availability");
}
