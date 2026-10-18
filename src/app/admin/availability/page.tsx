import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guards";
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
  await requireAdmin();

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
    <div className="bg-background px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-4xl text-ink">
          Weekly Availability
        </h1>

        <p className="mb-8 text-muted">
          Set your default opening hours. These apply every week unless a
          specific date is overridden below.
        </p>

        <form action={updateWeeklyAvailability} className="space-y-4">
          {DAYS.map((day) => {
            const existing = byDay.get(day);

            return (
              <div
                key={day}
                className="flex flex-wrap items-center gap-4 rounded-2xl bg-surface p-4 shadow-soft"
              >
                <span className="w-28 font-medium text-ink">
                  {DAY_LABELS[day]}
                </span>

                <label className="flex items-center gap-2 text-sm text-muted">
                  <input
                    type="checkbox"
                    name={`${day}-closed`}
                    aria-label={`${DAY_LABELS[day]} closed`}
                    defaultChecked={existing?.isClosed ?? true}
                  />
                  Closed
                </label>

                <label className="flex items-center gap-2 text-sm text-muted">
                  From
                  <input
                    type="time"
                    name={`${day}-start`}
                    aria-label={`${DAY_LABELS[day]} opening time`}
                    defaultValue={existing?.startTime ?? "09:00"}
                    className="rounded-xl border border-line-input bg-surface px-3 py-1.5"
                  />
                </label>

                <label className="flex items-center gap-2 text-sm text-muted">
                  To
                  <input
                    type="time"
                    name={`${day}-end`}
                    aria-label={`${DAY_LABELS[day]} closing time`}
                    defaultValue={existing?.endTime ?? "17:00"}
                    className="rounded-xl border border-line-input bg-surface px-3 py-1.5"
                  />
                </label>
              </div>
            );
          })}

          <Button type="submit">Save Hours</Button>
        </form>

        <h2 className="mb-2 mt-16 text-3xl text-ink">
          Date Overrides
        </h2>

        <p className="mb-6 text-muted">
          Close a specific date (a holiday, say) or give it different hours.
          An override replaces the weekly hours for that one date only.
        </p>

        {overrides.length === 0 ? (
          <p className="mb-8 text-muted">No upcoming overrides.</p>
        ) : (
          <ul className="mb-8 space-y-3">
            {overrides.map((override) => (
              <li
                key={override.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface p-4 shadow-soft"
              >
                <div>
                  <p className="font-medium text-ink">
                    {override.date.toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                  </p>
                  <p className="text-sm text-muted">
                    {override.isClosed
                      ? "Closed"
                      : `${override.startTime} – ${override.endTime}`}
                  </p>
                </div>

                <form action={deleteDateOverride.bind(null, override.id)}>
                  <button
                    type="submit"
                    className="rounded px-2 py-2 text-sm font-bold text-brand hover:underline"
                  >
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <div className="rounded-3xl bg-surface-alt p-6">
          <h3 className="mb-4 text-xl text-ink">
            Add an Override
          </h3>

          <OverrideForm minDate={today} />
        </div>
      </div>
    </div>
  );
}
