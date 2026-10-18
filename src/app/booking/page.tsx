import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import BookingWizard from "@/components/booking/BookingWizard";
import ButtonLink from "@/components/ui/ButtonLink";

export const metadata: Metadata = {
  title: "Book Appointment",
  description: "Book a grooming appointment for your dog.",
  robots: { index: false, follow: false },
};

export default async function BookingPage() {
  const session = await auth();

  const [dogs, services] = await Promise.all([
    session?.user
      ? prisma.dog.findMany({
          where: { ownerId: session.user.id },
          orderBy: { createdAt: "asc" },
        })
      : Promise.resolve([]),
    prisma.service.findMany({ orderBy: { price: "asc" } }),
  ]);

  return (
    <div className="bg-white px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-center text-4xl font-bold text-gray-900">
          Book Appointment
        </h1>

        {dogs.length === 0 ? (
          <div className="text-center">
            <p className="mb-6 text-gray-600">
              You&apos;ll need to add a dog to your account before booking an
              appointment.
            </p>

            <ButtonLink href="/customer/dogs/new">Add a Dog</ButtonLink>
          </div>
        ) : (
          <BookingWizard dogs={dogs} services={services} />
        )}
      </div>
    </div>
  );
}
