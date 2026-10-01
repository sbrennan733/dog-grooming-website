import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BookingStatusSelect from "@/components/admin/BookingStatusSelect";
import MarkAssessmentButton from "@/components/admin/MarkAssessmentButton";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Admin",
  description: "Manage bookings and availability.",
  robots: { index: false, follow: false },
};

function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

export default async function AdminPage() {
  const bookings = await prisma.booking.findMany({
    include: { user: true, dog: true, service: true },
    orderBy: { scheduledAt: "asc" },
  });

  return (
    <div className="bg-white px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl font-bold text-gray-900">Bookings</h1>

          <Link href="/admin/availability">
            <Button variant="secondary">Manage Availability</Button>
          </Link>
        </div>

        {bookings.length === 0 ? (
          <p className="text-gray-600">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-3 pr-4 font-medium">Customer</th>
                  <th className="py-3 pr-4 font-medium">Dog</th>
                  <th className="py-3 pr-4 font-medium">Service</th>
                  <th className="py-3 pr-4 font-medium">Date</th>
                  <th className="py-3 pr-4 font-medium">Deposit</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 font-medium">Assessment</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b">
                    <td className="py-3 pr-4 text-gray-900">
                      {booking.user.name}
                    </td>
                    <td className="py-3 pr-4 text-gray-900">
                      {booking.dog.name}
                    </td>
                    <td className="py-3 pr-4 text-gray-900">
                      {booking.service.name}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap text-gray-700">
                      {booking.scheduledAt.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        timeZone: "UTC",
                      })}{" "}
                      {booking.scheduledAt.toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "UTC",
                      })}
                    </td>
                    <td className="py-3 pr-4 text-gray-700">
                      {formatPrice(booking.depositAtBooking)}
                    </td>
                    <td className="py-3 pr-4">
                      <BookingStatusSelect
                        bookingId={booking.id}
                        status={booking.status}
                      />
                    </td>
                    <td className="py-3 pr-4">
                      {booking.service.isAssessment &&
                        !booking.dog.assessmentCompletedAt && (
                          <MarkAssessmentButton dogId={booking.dog.id} />
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
