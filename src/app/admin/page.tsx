import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import BookingActions from "@/components/admin/BookingActions";
import MarkAssessmentButton from "@/components/admin/MarkAssessmentButton";
import ButtonLink from "@/components/ui/ButtonLink";
import { BUSINESS_TIME_ZONE } from "@/lib/timezone";
import { businessInfo } from "@/data/business";
import { priceForDog } from "@/lib/dog-size";
import type { BookingStatus } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Admin",
  description: "Manage bookings and availability.",
  robots: { index: false, follow: false },
};

function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

// Row tint so confirmed and cancelled bookings stand out at a glance. The
// status label in the row says the same in words.
const ROW_STYLES: Record<BookingStatus, string> = {
  PENDING: "",
  CONFIRMED: "bg-ok-soft",
  CANCELLED: "bg-danger-soft",
  COMPLETED: "",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  await requireAdmin();

  const { view } = await searchParams;
  const showingPast = view === "past";
  const now = new Date();

  // Upcoming: anything still open, plus cancellations that haven't happened
  // yet. Past: completed bookings and cancellations whose time has gone.
  const upcomingWhere = {
    OR: [
      { status: { in: ["PENDING", "CONFIRMED"] as BookingStatus[] } },
      { status: "CANCELLED" as BookingStatus, scheduledAt: { gte: now } },
    ],
  };
  const pastWhere = {
    OR: [
      { status: "COMPLETED" as BookingStatus },
      { status: "CANCELLED" as BookingStatus, scheduledAt: { lt: now } },
    ],
  };

  const [bookings, upcomingCount, pastCount, unreadMessages] =
    await Promise.all([
      prisma.booking.findMany({
        where: showingPast ? pastWhere : upcomingWhere,
        include: {
          user: true,
          dog: true,
          service: true,
          consent: { select: { id: true } },
        },
        orderBy: { scheduledAt: showingPast ? "desc" : "asc" },
        take: 300,
      }),
      prisma.booking.count({ where: upcomingWhere }),
      prisma.booking.count({ where: pastWhere }),
      prisma.contactMessage.count({ where: { isRead: false } }),
    ]);

  const tabClass = (active: boolean) =>
    `rounded-full px-5 py-2 text-sm font-bold transition ${
      active
        ? "bg-brand text-on-brand"
        : "border-2 border-line-input bg-surface text-ink hover:border-brand"
    }`;

  return (
    <div className="bg-background px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl text-ink">Bookings</h1>

          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/admin/messages" variant="secondary">
              {unreadMessages > 0
                ? `Messages (${unreadMessages} new)`
                : "Messages"}
            </ButtonLink>

            <ButtonLink href="/admin/availability" variant="secondary">
              Appointment Times
            </ButtonLink>
          </div>
        </div>

        <nav aria-label="Booking views" className="mb-6 flex flex-wrap gap-3">
          <Link
            href="/admin"
            aria-current={showingPast ? undefined : "page"}
            className={tabClass(!showingPast)}
          >
            Upcoming ({upcomingCount})
          </Link>

          <Link
            href="/admin?view=past"
            aria-current={showingPast ? "page" : undefined}
            className={tabClass(showingPast)}
          >
            Past bookings ({pastCount})
          </Link>
        </nav>

        {bookings.length === 0 ? (
          <p className="text-muted">
            {showingPast
              ? "No past bookings yet. Completed appointments will appear here."
              : "No upcoming bookings."}
          </p>
        ) : (
          <div
            role="region"
            aria-label={showingPast ? "Past bookings" : "Upcoming bookings"}
            tabIndex={0}
            className="relative overflow-x-auto rounded-3xl bg-surface p-6 shadow-soft"
          >
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="py-3 pr-4 font-medium">Customer</th>
                  <th className="py-3 pr-4 font-medium">Dog</th>
                  <th className="py-3 pr-4 font-medium">Service</th>
                  <th className="py-3 pr-4 font-medium">Date</th>
                  <th className="py-3 pr-4 font-medium">Price</th>
                  {businessInfo.payment.depositsEnabled && (
                    <th className="py-3 pr-4 font-medium">Deposit</th>
                  )}
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 font-medium">Consent form</th>
                  <th className="py-3 pr-4 font-medium">Assessment</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className={`border-b border-line last:border-b-0 ${ROW_STYLES[booking.status]}`}
                  >
                    <td className="py-3 pl-3 pr-4 text-ink">
                      {booking.user.name}
                    </td>
                    <td className="py-3 pr-4 text-ink">{booking.dog.name}</td>
                    <td className="py-3 pr-4 text-ink">
                      {booking.service.name}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap text-ink">
                      {booking.scheduledAt.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        timeZone: BUSINESS_TIME_ZONE,
                      })}{" "}
                      {booking.scheduledAt.toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: BUSINESS_TIME_ZONE,
                      })}
                    </td>
                    <td className="py-3 pr-4 text-ink">
                      {priceForDog(booking.service, booking.dog).isFrom &&
                        "From "}
                      {formatPrice(booking.priceAtBooking)}
                    </td>
                    {businessInfo.payment.depositsEnabled && (
                      <td className="py-3 pr-4 text-ink">
                        {formatPrice(booking.depositAtBooking)}
                      </td>
                    )}
                    <td className="py-3 pr-4">
                      <BookingActions
                        bookingId={booking.id}
                        status={booking.status}
                        hasPassed={booking.scheduledAt <= now}
                        customerName={booking.user.name}
                        customerEmail={booking.user.email}
                        dogName={booking.dog.name}
                      />
                    </td>
                    <td className="py-3 pr-4">
                      {booking.consent ? (
                        <a
                          href={`/admin/bookings/${booking.id}/consent`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-brand hover:underline"
                        >
                          View PDF
                          <span className="sr-only">
                            {` for ${booking.user.name}, ${booking.dog.name} (opens in a new tab)`}
                          </span>
                        </a>
                      ) : (
                        <span className="text-muted">Not signed</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      {booking.service.isAssessment &&
                        !booking.dog.assessmentCompletedAt &&
                        booking.status !== "CANCELLED" && (
                          <MarkAssessmentButton
                            dogId={booking.dog.id}
                            dogName={booking.dog.name}
                          />
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
