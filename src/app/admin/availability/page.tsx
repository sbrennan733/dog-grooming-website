import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Button from "@/components/ui/Button";
import { updateWeeklyAvailability } from "./actions";
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
  const templates = await prisma.availabilityTemplate.findMany();
  const byDay = new Map(templates.map((template) => [template.dayOfWeek, template]));

  return (
    <div className="bg-white px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-4xl font-bold text-gray-900">
          Weekly Availability
        </h1>

        <p className="mb-8 text-gray-600">
          Set your default opening hours. These apply every week. (Specific
          date overrides, e.g. holidays, aren&apos;t manageable here yet.)
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
      </div>
    </div>
  );
}
