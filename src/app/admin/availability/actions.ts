"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import { OPENING_HOURS_TAG } from "@/lib/opening-hours";
import { prisma } from "@/lib/prisma";
import { getTodayInBusinessZone, zonedWallTimeToUtc } from "@/lib/timezone";
import {
  addSlotsSchema,
  type AddSlotsFormState,
} from "@/lib/validations/availability";
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
  await requireAdmin();

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

  // The Footer shows these weekly hours on every page.
  updateTag(OPENING_HOURS_TAG);
  revalidatePath("/admin/availability");
}

export async function addAvailableSlots(
  _prevState: AddSlotsFormState,
  formData: FormData
): Promise<AddSlotsFormState> {
  await requireAdmin();

  const validatedFields = addSlotsSchema.safeParse({
    date: formData.get("date"),
    times: formData.getAll("times"),
  });

  const values = {
    date: String(formData.get("date") ?? ""),
    times: formData.getAll("times").map(String),
  };

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, values };
  }

  const { date, times } = validatedFields.data;

  if (date < getTodayInBusinessZone()) {
    return { errors: { date: ["Choose today or a future date."] }, values };
  }

  // Slots are keyed by calendar date, stored as midnight UTC.
  const result = await prisma.availableSlot.createMany({
    data: times.map((startTime) => ({
      date: new Date(`${date}T00:00:00.000Z`),
      startTime,
    })),
    skipDuplicates: true,
  });

  revalidatePath("/admin/availability");
  revalidatePath("/booking");

  const skipped = times.length - result.count;
  return {
    message:
      result.count === 0
        ? "Those times were already open for that date."
        : `Opened ${result.count} time${result.count === 1 ? "" : "s"}.${
            skipped > 0 ? ` ${skipped} already open.` : ""
          }`,
  };
}

// An opened time can only be taken away while nobody has booked it.
export async function removeAvailableSlot(slotId: string) {
  await requireAdmin();

  const slot = await prisma.availableSlot.findUnique({ where: { id: slotId } });
  if (!slot) {
    return;
  }

  const date = slot.date.toISOString().slice(0, 10);
  const start = zonedWallTimeToUtc(date, slot.startTime);

  const booking = await prisma.booking.findFirst({
    where: { scheduledAt: start, status: { not: "CANCELLED" } },
  });
  if (booking) {
    return;
  }

  await prisma.availableSlot.delete({ where: { id: slotId } });

  revalidatePath("/admin/availability");
  revalidatePath("/booking");
}
