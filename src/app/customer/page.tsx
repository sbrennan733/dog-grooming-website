import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DogCard from "@/components/dogs/DogCard";
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import CancelBookingButton from "@/components/bookings/CancelBookingButton";
import ButtonLink from "@/components/ui/ButtonLink";
import VerificationBanner from "@/components/account/VerificationBanner";
import { BUSINESS_TIME_ZONE } from "@/lib/timezone";
import { businessInfo } from "@/data/business";

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

  const [account, dogs, bookings] = session?.user
    ? await Promise.all([
        prisma.user.findUnique({
          where: { id: session.user.id },
          select: { email: true, emailVerified: true },
        }),
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
    : [null, [], []];

  return (
    <div className="bg-background px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-4xl text-ink">
          Welcome, {session?.user.name}
        </h1>

        {account && !account.emailVerified && (
          <div className="mt-6">
            <VerificationBanner email={account.email} />
          </div>
        )}

        <div className="mt-12 flex items-center justify-between">
          <h2 className="text-2xl text-ink">My Dogs</h2>

          <ButtonLink href="/customer/dogs/new">Add a Dog</ButtonLink>
        </div>

        {dogs.length === 0 ? (
          <p className="mt-6 text-muted">
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
          <h2 className="text-2xl text-ink">My Bookings</h2>

          <ButtonLink href="/booking" variant="secondary">Book Appointment</ButtonLink>
        </div>

        {bookings.length === 0 ? (
          <p className="mt-6 text-muted">
            You don&apos;t have any bookings yet.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface p-5 shadow-soft"
              >
                <div>
                  <p className="font-semibold text-ink">
                    {booking.service.name} for {booking.dog.name}
                  </p>
                  <p className="text-sm text-muted">
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
                  <p className="text-sm text-muted">
                    {businessInfo.payment.depositsEnabled
                      ? `Deposit: ${formatPrice(booking.depositAtBooking)}`
                      : `Price: ${formatPrice(booking.priceAtBooking)} (cash at your appointment)`}
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
