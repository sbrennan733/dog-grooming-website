import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DogCard from "@/components/dogs/DogCard";
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import CancelBookingButton from "@/components/bookings/CancelBookingButton";
import Button from "@/components/ui/Button";
import { BUSINESS_TIME_ZONE } from "@/lib/timezone";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your dogs and bookings.",
  robots: { index: false, follow: false },
};

function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

export default async function CustomerDashboardPage() {
  const session = await auth();
  const now = new Date();

  const [dogs, bookings] = session?.user
    ? await Promise.all([
        prisma.dog.findMany({
          where: { ownerId: session.user.id },
          orderBy: { createdAt: "asc" },
        }),
        prisma.booking.findMany({
          where: { userId: session.user.id },
          include: { dog: true, service: true },
          orderBy: { scheduledAt: "asc" },
        }),
      ])
    : [[], []];

  return (
    <div className="bg-white px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-4xl font-bold text-gray-900">
          Welcome, {session?.user.name}
        </h1>

        <div className="mt-12 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">My Dogs</h2>

          <Link href="/customer/dogs/new">
            <Button>Add a Dog</Button>
          </Link>
        </div>

        {dogs.length === 0 ? (
          <p className="mt-6 text-gray-600">
            You haven&apos;t added any dogs yet.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {dogs.map((dog) => (
              <DogCard key={dog.id} dog={dog} />
            ))}
          </div>
        )}

        <div className="mt-12 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>

          <Link href="/booking">
            <Button variant="secondary">Book Appointment</Button>
          </Link>
        </div>

        {bookings.length === 0 ? (
          <p className="mt-6 text-gray-600">
            You don&apos;t have any bookings yet.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {booking.service.name} for {booking.dog.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {booking.scheduledAt.toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      timeZone: BUSINESS_TIME_ZONE,
                    })}{" "}
                    at{" "}
                    {booking.scheduledAt.toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: BUSINESS_TIME_ZONE,
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    Deposit: {formatPrice(booking.depositAtBooking)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <BookingStatusBadge status={booking.status} />

                  {(booking.status === "PENDING" ||
                    booking.status === "CONFIRMED") &&
                    booking.scheduledAt > now && (
                      <CancelBookingButton bookingId={booking.id} />
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
