import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { DayOfWeek } from "@/generated/prisma/client";

export const OPENING_HOURS_TAG = "opening-hours";

const DAY_ORDER: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const FULL_NAMES: Record<DayOfWeek, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export interface WeeklyHoursRow {
  dayOfWeek: DayOfWeek;
  isClosed: boolean;
  startTime: string | null;
  endTime: string | null;
}

export interface OpeningHoursLine {
  label: string;
  hours: string;
}

function describeHours(row: WeeklyHoursRow): string {
  if (row.isClosed || !row.startTime || !row.endTime) {
    return "Closed";
  }
  return `${row.startTime} – ${row.endTime}`;
}

// Collapses consecutive days with identical hours into one line, e.g.
// Monday–Friday 09:00 – 17:00 / Saturday 09:00 – 13:00 / Sunday Closed.
export function formatOpeningHours(rows: WeeklyHoursRow[]): OpeningHoursLine[] {
  const byDay = new Map(rows.map((row) => [row.dayOfWeek, row]));

  const groups: { days: WeeklyHoursRow[]; hours: string }[] = [];
  let current: (typeof groups)[number] | null = null;

  for (const day of DAY_ORDER) {
    const row = byDay.get(day);

    // A day with no row at all ends the current group, so a gap is never
    // folded into a range like "Mon – Fri" that would imply it is open.
    if (!row) {
      current = null;
      continue;
    }

    const hours = describeHours(row);

    if (current && current.hours === hours) {
      current.days.push(row);
    } else {
      current = { days: [row], hours };
      groups.push(current);
    }
  }

  return groups.map((group) => {
    const first = FULL_NAMES[group.days[0].dayOfWeek];
    const last = FULL_NAMES[group.days[group.days.length - 1].dayOfWeek];

    return {
      label: group.days.length === 1 ? first : `${first.slice(0, 3)} – ${last.slice(0, 3)}`,
      hours: group.hours,
    };
  });
}

// Cached so the Footer (which appears on every page) doesn't query the
// database per request; the admin's "Save Hours" action expires this tag.
export const getWeeklyOpeningHours = unstable_cache(
  async (): Promise<OpeningHoursLine[]> => {
    const rows = await prisma.availabilityTemplate.findMany();
    return formatOpeningHours(rows);
  },
  ["weekly-opening-hours"],
  { tags: [OPENING_HOURS_TAG] }
);
