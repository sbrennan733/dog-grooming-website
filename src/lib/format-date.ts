// Formats a calendar date string ("2026-10-28") for display. Calendar dates
// have no time zone, so they are read and printed as UTC to avoid drifting
// a day.
export function formatDateString(
  dateStr: string,
  style: "short" | "long" = "long"
): string {
  return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: style === "short" ? "short" : "long",
    day: "numeric",
    month: style === "short" ? "short" : "long",
    year: style === "short" ? undefined : "numeric",
    timeZone: "UTC",
  });
}
