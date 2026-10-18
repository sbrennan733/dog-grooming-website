// Belfast follows the same rules as London (GMT in winter, BST in summer).
export const BUSINESS_TIME_ZONE = "Europe/London";

function getFormatter(timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getOffsetMinutes(utcMs: number, timeZone: string): number {
  const baseMs = Math.floor(utcMs / 1000) * 1000;
  const parts = getFormatter(timeZone).formatToParts(new Date(baseMs));
  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);

  const wallAsUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second")
  );

  return (wallAsUtc - baseMs) / 60000;
}

// Converts a wall-clock date + time in the given zone ("2026-10-05",
// "09:00") into the real UTC instant it refers to.
export function zonedWallTimeToUtc(
  dateStr: string,
  timeStr: string,
  timeZone: string = BUSINESS_TIME_ZONE
): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  const wallAsUtc = Date.UTC(year, month - 1, day, hours, minutes);

  // Two passes so the offset is taken at the corrected instant, which
  // matters right around a clock change.
  const firstGuess = wallAsUtc - getOffsetMinutes(wallAsUtc, timeZone) * 60000;
  const secondGuess =
    wallAsUtc - getOffsetMinutes(firstGuess, timeZone) * 60000;

  return new Date(secondGuess);
}

export interface ZonedParts {
  date: string;
  time: string;
  minutes: number;
}

// The wall-clock date/time a UTC instant corresponds to in the given zone.
export function getZonedParts(
  instant: Date,
  timeZone: string = BUSINESS_TIME_ZONE
): ZonedParts {
  const parts = getFormatter(timeZone).formatToParts(instant);
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  const hours = get("hour");
  const minutes = get("minute");

  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${hours}:${minutes}`,
    minutes: Number(hours) * 60 + Number(minutes),
  };
}

export function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

export function getTodayInBusinessZone(): string {
  return getZonedParts(new Date()).date;
}
