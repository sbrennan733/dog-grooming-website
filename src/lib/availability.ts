import { prisma } from "@/lib/prisma";
import {
  addDays,
  getTodayInBusinessZone,
  getZonedParts,
  zonedWallTimeToUtc,
} from "@/lib/timezone";

// Nothing is bookable by default. The admin opens specific start times on
// specific dates (AvailableSlot); a customer can only book one of those,
// and only while it isn't blocked by a booking already made.

const MAX_DATES_OFFERED = 60;

function timeStringToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function parseDateOnly(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

interface Range {
  start: number;
  end: number;
}

// Time ranges (minutes from midnight, business time) already taken by
// non-cancelled bookings, grouped by calendar date. `toDate` is exclusive.
async function getBookedRangesByDate(
  fromDate: string,
  toDate: string
): Promise<Map<string, Range[]>> {
  const bookings = await prisma.booking.findMany({
    where: {
      scheduledAt: {
        gte: zonedWallTimeToUtc(fromDate, "00:00"),
        lt: zonedWallTimeToUtc(toDate, "00:00"),
      },
      status: { not: "CANCELLED" },
    },
    include: { service: true },
  });

  const byDate = new Map<string, Range[]>();
  for (const booking of bookings) {
    const { date, minutes } = getZonedParts(booking.scheduledAt);
    const ranges = byDate.get(date) ?? [];
    ranges.push({ start: minutes, end: minutes + booking.service.duration });
    byDate.set(date, ranges);
  }

  return byDate;
}

// Which of a date's opened start times a service can still use: not in the
// past, and not overlapping an existing booking.
function freeStartTimes(
  dateStr: string,
  startTimes: string[],
  bookedRanges: Range[],
  duration: number
): string[] {
  const now = getZonedParts(new Date());

  return startTimes.filter((time) => {
    const start = timeStringToMinutes(time);

    if (dateStr === now.date && start <= now.minutes) {
      return false;
    }

    const end = start + duration;
    return !bookedRanges.some(
      (range) => start < range.end && end > range.start
    );
  });
}

// Returns bookable start times ("HH:mm") for a date + service. Used both to
// show times to the customer and to re-validate their choice at the moment
// they book.
export async function getAvailableSlots(
  dateStr: string,
  serviceId: string
): Promise<string[]> {
  // The UI only offers real dates, but the Server Action can be called
  // directly, so past dates are rejected here too.
  if (dateStr < getTodayInBusinessZone()) {
    return [];
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.isActive) {
    return [];
  }

  const slots = await prisma.availableSlot.findMany({
    where: { date: parseDateOnly(dateStr) },
    orderBy: { startTime: "asc" },
  });
  if (slots.length === 0) {
    return [];
  }

  const bookedByDate = await getBookedRangesByDate(
    dateStr,
    addDays(dateStr, 1)
  );

  return freeStartTimes(
    dateStr,
    slots.map((slot) => slot.startTime),
    bookedByDate.get(dateStr) ?? [],
    service.duration
  );
}

// Upcoming dates ("YYYY-MM-DD") that have at least one time this service
// can still book.
export async function getAvailableDates(serviceId: string): Promise<string[]> {
  const today = getTodayInBusinessZone();

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.isActive) {
    return [];
  }

  const slots = await prisma.availableSlot.findMany({
    where: { date: { gte: parseDateOnly(today) } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
  if (slots.length === 0) {
    return [];
  }

  const timesByDate = new Map<string, string[]>();
  for (const slot of slots) {
    const dateStr = toDateString(slot.date);
    timesByDate.set(dateStr, [
      ...(timesByDate.get(dateStr) ?? []),
      slot.startTime,
    ]);
  }

  const lastDate = toDateString(slots[slots.length - 1].date);
  const bookedByDate = await getBookedRangesByDate(today, addDays(lastDate, 1));

  const dates: string[] = [];
  for (const [dateStr, times] of timesByDate) {
    const free = freeStartTimes(
      dateStr,
      times,
      bookedByDate.get(dateStr) ?? [],
      service.duration
    );
    if (free.length > 0) {
      dates.push(dateStr);
    }
    if (dates.length >= MAX_DATES_OFFERED) {
      break;
    }
  }

  return dates;
}
