"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import { OPENING_HOURS_TAG } from "@/lib/opening-hours";
import { prisma } from "@/lib/prisma";
import {
  addDays,
  getTodayInBusinessZone,
  zonedWallTimeToUtc,
} from "@/lib/timezone";
import {
  overrideSchema,
  type OverrideFormState,
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

export async function saveDateOverride(
  _prevState: OverrideFormState,
  formData: FormData
): Promise<OverrideFormState> {
  await requireAdmin();

  const validatedFields = overrideSchema.safeParse({
    date: formData.get("date"),
    isClosed: formData.get("isClosed") === "on",
    startTime: formData.get("startTime") ?? "",
    endTime: formData.get("endTime") ?? "",
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { date, isClosed, startTime, endTime } = validatedFields.data;

  if (date < getTodayInBusinessZone()) {
    return { errors: { date: ["Choose today or a future date."] } };
  }

  // Overrides are keyed by calendar date, stored as midnight UTC.
  const dateKey = new Date(`${date}T00:00:00.000Z`);

  await prisma.availabilityOverride.upsert({
    where: { date: dateKey },
    update: {
      isClosed,
      startTime: isClosed ? null : startTime,
      endTime: isClosed ? null : endTime,
    },
    create: {
      date: dateKey,
      isClosed,
      startTime: isClosed ? null : startTime,
      endTime: isClosed ? null : endTime,
    },
  });

  // Changing a day's hours doesn't touch bookings already made for it, so
  // tell the admin if any are now sitting on a day they've changed.
  const existingBookings = await prisma.booking.count({
    where: {
      scheduledAt: {
        gte: zonedWallTimeToUtc(date, "00:00"),
        lt: zonedWallTimeToUtc(addDays(date, 1), "00:00"),
      },
      status: { not: "CANCELLED" },
    },
  });

  revalidatePath("/admin/availability");

  return {
    message:
      existingBookings > 0
        ? `Saved. ${existingBookings} existing booking${
            existingBookings === 1 ? "" : "s"
          } on this date ${
            existingBookings === 1 ? "was" : "were"
          } not changed — review ${
            existingBookings === 1 ? "it" : "them"
          } on the Bookings page.`
        : "Saved.",
  };
}

export async function deleteDateOverride(overrideId: string) {
  await requireAdmin();

  await prisma.availabilityOverride.deleteMany({ where: { id: overrideId } });

  revalidatePath("/admin/availability");
}
