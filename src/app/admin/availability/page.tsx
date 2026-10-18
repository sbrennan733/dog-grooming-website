import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Button from "@/components/ui/Button";
import OverrideForm from "@/components/admin/OverrideForm";
import { getTodayInBusinessZone } from "@/lib/timezone";
import { deleteDateOverride, updateWeeklyAvailability } from "./actions";
import type { DayOfWeek } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Manage Availability",
  robots: { index: false, follow: false },
};

const DAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export default async function AvailabilityPage() {
  const today = getTodayInBusinessZone();

  const [templates, overrides] = await Promise.all([
    prisma.availabilityTemplate.findMany(),
    prisma.availabilityOverride.findMany({
      where: { date: { gte: new Date(`${today}T00:00:00.000Z`) } },
      orderBy: { date: "asc" },
    }),
  ]);
  const byDay = new Map(templates.map((template) => [template.dayOfWeek, template]));

  return (
    <div className="bg-white px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-4xl font-bold text-gray-900">
          Weekly Availability
        </h1>

        <p className="mb-8 text-gray-600">
          Set your default opening hours. These apply every week unless a
          specific date is overridden below.
        </p>

        <form action={updateWeeklyAvailability} className="space-y-4">
          {DAYS.map((day) => {
            const existing = byDay.get(day);

            return (
              <div
                key={day}
                className="flex flex-wrap items-center gap-4 rounded-lg border p-4"
              >
                <span className="w-28 font-medium text-gray-900">
                  {DAY_LABELS[day]}
                </span>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name={`${day}-closed`}
                    defaultChecked={existing?.isClosed ?? true}
                  />
                  Closed
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  From
                  <input
                    type="time"
                    name={`${day}-start`}
                    defaultValue={existing?.startTime ?? "09:00"}
                    className="rounded-lg border border-gray-300 px-2 py-1"
                  />
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  To
                  <input
                    type="time"
                    name={`${day}-end`}
                    defaultValue={existing?.endTime ?? "17:00"}
                    className="rounded-lg border border-gray-300 px-2 py-1"
                  />
                </label>
              </div>
            );
          })}

          <Button type="submit">Save Hours</Button>
        </form>

        <h2 className="mb-2 mt-16 text-3xl font-bold text-gray-900">
          Date Overrides
        </h2>

        <p className="mb-6 text-gray-600">
          Close a specific date (a holiday, say) or give it different hours.
          An override replaces the weekly hours for that one date only.
        </p>

        {overrides.length === 0 ? (
          <p className="mb-8 text-gray-600">No upcoming overrides.</p>
        ) : (
          <ul className="mb-8 space-y-3">
            {overrides.map((override) => (
              <li
                key={override.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {override.date.toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {override.isClosed
                      ? "Closed"
                      : `${override.startTime} – ${override.endTime}`}
                  </p>
                </div>

                <form action={deleteDateOverride.bind(null, override.id)}>
                  <button
                    type="submit"
                    className="text-sm font-medium text-gray-900 hover:underline"
                  >
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <div className="rounded-2xl border bg-gray-50 p-6">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">
            Add an Override
          </h3>

          <OverrideForm minDate={today} />
        </div>
      </div>
    </div>
  );
}
