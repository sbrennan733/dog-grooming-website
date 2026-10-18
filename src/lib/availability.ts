import { prisma } from "@/lib/prisma";
import {
  addDays,
  getTodayInBusinessZone,
  getZonedParts,
  zonedWallTimeToUtc,
} from "@/lib/timezone";
import type { DayOfWeek } from "@/generated/prisma/client";

const DAY_NAMES: DayOfWeek[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

// Slot start times, minutes-from-midnight, used by all the helpers below.
const SLOT_STEP_MINUTES = 30;

function timeStringToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const mins = (minutes % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
}

function parseDateOnly(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

interface DayHours {
  isClosed: boolean;
  startTime: string | null;
  endTime: string | null;
}

// A date-specific AvailabilityOverride always wins over the recurring
// AvailabilityTemplate for that day of the week.
async function getDayHours(dateStr: string): Promise<DayHours> {
  const date = parseDateOnly(dateStr);

  const override = await prisma.availabilityOverride.findUnique({
    where: { date },
  });

  if (override) {
    return {
      isClosed: override.isClosed,
      startTime: override.startTime,
      endTime: override.endTime,
    };
  }

  const dayOfWeek = DAY_NAMES[date.getUTCDay()];
  const template = await prisma.availabilityTemplate.findUnique({
    where: { dayOfWeek },
  });

  if (!template || template.isClosed || !template.startTime || !template.endTime) {
    return { isClosed: true, startTime: null, endTime: null };
  }

  return {
    isClosed: false,
    startTime: template.startTime,
    endTime: template.endTime,
  };
}

// Returns bookable start times ("HH:mm") for a given date + service,
// accounting for business hours and existing (non-cancelled) bookings
// that day. Used both to show slots to the customer and to re-validate
// their chosen slot is still free at the moment they actually book.
export async function getAvailableSlots(
  dateStr: string,
  serviceId: string
): Promise<string[]> {
  // The date picker's `min` attribute only stops the UI from offering a
  // past date — it doesn't stop someone calling the Server Action
  // directly, so the past-date rejection has to live here too.
  const todayStr = getTodayInBusinessZone();
  if (dateStr < todayStr) {
    return [];
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    return [];
  }

  const { isClosed, startTime, endTime } = await getDayHours(dateStr);
  if (isClosed || !startTime || !endTime) {
    return [];
  }

  const dayStart = timeStringToMinutes(startTime);
  const dayEnd = timeStringToMinutes(endTime);
  const duration = service.duration;

  // The business day runs midnight-to-midnight in local time, which is
  // not the same as midnight-to-midnight UTC while BST is in effect.
  const dayStartInstant = zonedWallTimeToUtc(dateStr, "00:00");
  const dayEndInstant = zonedWallTimeToUtc(addDays(dateStr, 1), "00:00");

  const existingBookings = await prisma.booking.findMany({
    where: {
      scheduledAt: { gte: dayStartInstant, lt: dayEndInstant },
      status: { not: "CANCELLED" },
    },
    include: { service: true },
  });

  const bookedRanges = existingBookings.map((booking) => {
    const { minutes: start } = getZonedParts(booking.scheduledAt);
    return { start, end: start + booking.service.duration };
  });

  const nowParts = getZonedParts(new Date());
  const isToday = dateStr === nowParts.date;
  const nowMinutes = nowParts.minutes;

  const slots: string[] = [];
  for (
    let start = dayStart;
    start + duration <= dayEnd;
    start += SLOT_STEP_MINUTES
  ) {
    if (isToday && start <= nowMinutes) {
      continue;
    }

    const end = start + duration;
    const overlapsExisting = bookedRanges.some(
      (range) => start < range.end && end > range.start
    );

    if (!overlapsExisting) {
      slots.push(minutesToTimeString(start));
    }
  }

  return slots;
}
