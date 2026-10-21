import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import BookingStatusSelect from "@/components/admin/BookingStatusSelect";
import MarkAssessmentButton from "@/components/admin/MarkAssessmentButton";
import ButtonLink from "@/components/ui/ButtonLink";
import { BUSINESS_TIME_ZONE } from "@/lib/timezone";
import { businessInfo } from "@/data/business";

export const metadata: Metadata = {
  title: "Admin",
  description: "Manage bookings and availability.",
  robots: { index: false, follow: false },
};

function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

export default async function AdminPage() {
  await requireAdmin();

  const [bookings, unreadMessages] = await Promise.all([
    prisma.booking.findMany({
      include: { user: true, dog: true, service: true },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.contactMessage.count({ where: { isRead: false } }),
  ]);

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
              Manage Availability
            </ButtonLink>
          </div>
        </div>

        {bookings.length === 0 ? (
          <p className="text-muted">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-3xl bg-surface p-6 shadow-soft">
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
                  <th className="py-3 pr-4 font-medium">Assessment</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-line last:border-b-0">
                    <td className="py-3 pr-4 text-ink">
                      {booking.user.name}
                    </td>
                    <td className="py-3 pr-4 text-ink">
                      {booking.dog.name}
                    </td>
                    <td className="py-3 pr-4 text-ink">
                      {booking.service.name}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap text-muted">
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
                    <td className="py-3 pr-4 text-muted">
                      {formatPrice(booking.priceAtBooking)}
                    </td>
                    {businessInfo.payment.depositsEnabled && (
                      <td className="py-3 pr-4 text-muted">
                        {formatPrice(booking.depositAtBooking)}
                      </td>
                    )}
                    <td className="py-3 pr-4">
                      <BookingStatusSelect
                        bookingId={booking.id}
                        status={booking.status}
                        label={`${booking.user.name}, ${booking.dog.name}`}
                      />
                    </td>
                    <td className="py-3 pr-4">
                      {booking.service.isAssessment &&
                        !booking.dog.assessmentCompletedAt && (
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
