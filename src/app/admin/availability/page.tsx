import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import AddSlotsForm from "@/components/admin/AddSlotsForm";
import { formatDateString } from "@/lib/format-date";
import { getTodayInBusinessZone, getZonedParts } from "@/lib/timezone";
import { removeAvailableSlot, updateWeeklyAvailability } from "./actions";
import type { DayOfWeek } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Appointment Times",
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
  const todayDate = new Date(`${today}T00:00:00.000Z`);

  const [templates, slots, upcomingBookings] = await Promise.all([
    prisma.availabilityTemplate.findMany(),
    prisma.availableSlot.findMany({
      where: { date: { gte: todayDate } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
    prisma.booking.findMany({
      where: {
        scheduledAt: { gte: todayDate },
        status: { not: "CANCELLED" },
      },
      select: { scheduledAt: true },
    }),
  ]);

  const byDay = new Map(templates.map((template) => [template.dayOfWeek, template]));

  // "2026-10-28|09:00" for every time that already has a booking starting.
  const bookedStarts = new Set(
    upcomingBookings.map((booking) => {
      const { date, time } = getZonedParts(booking.scheduledAt);
      return `${date}|${time}`;
    })
  );

  const slotsByDate = new Map<string, typeof slots>();
  for (const slot of slots) {
    const dateStr = slot.date.toISOString().slice(0, 10);
    slotsByDate.set(dateStr, [...(slotsByDate.get(dateStr) ?? []), slot]);
  }

  return (
    <div className="bg-background px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl text-ink">Appointment Times</h1>

          <ButtonLink href="/admin" variant="secondary">
            Back to Bookings
          </ButtonLink>
        </div>

        <p className="mb-8 text-muted">
          Customers can only book the times you open here. Nothing is
          bookable until you add it.
        </p>

        <div className="mb-10 rounded-3xl bg-surface-alt p-6">
          <h2 className="mb-4 text-xl text-ink">Open times on a date</h2>

          <AddSlotsForm minDate={today} />
        </div>

        <h2 className="mb-4 text-3xl text-ink">Upcoming open times</h2>

        {slotsByDate.size === 0 ? (
          <p className="mb-8 text-muted">
            No times are open. Customers can&apos;t book until you add some.
          </p>
        ) : (
          <ul className="mb-8 space-y-4">
            {[...slotsByDate.entries()].map(([dateStr, dateSlots]) => (
              <li
                key={dateStr}
                className="rounded-2xl bg-surface p-4 shadow-soft"
              >
                <p className="mb-3 font-medium text-ink">
                  {formatDateString(dateStr)}
                </p>

                <ul className="flex flex-wrap gap-2">
                  {dateSlots.map((slot) => {
                    const isBooked = bookedStarts.has(
                      `${dateStr}|${slot.startTime}`
                    );

                    return (
                      <li key={slot.id}>
                        {isBooked ? (
                          <span className="inline-block rounded-full bg-ok-soft px-4 py-1.5 text-sm font-semibold text-ok-ink">
                            {slot.startTime} · Booked
                          </span>
                        ) : (
                          <form
                            action={removeAvailableSlot.bind(null, slot.id)}
                          >
                            <button
                              type="submit"
                              className="rounded-full border-2 border-line-input bg-surface px-4 py-1.5 text-sm font-semibold text-ink hover:border-danger hover:text-danger"
                            >
                              {slot.startTime}
                              <span aria-hidden="true"> ×</span>
                              <span className="sr-only">
                                , remove this time
                              </span>
                            </button>
                          </form>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        )}

        <h2 className="mb-2 mt-16 text-3xl text-ink">Opening hours</h2>

        <p className="mb-6 text-muted">
          These are the hours shown on the website. They don&apos;t decide
          what can be booked; that&apos;s the times you open above.
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
      </div>
    </div>
  );
}
