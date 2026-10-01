import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DogCard from "@/components/dogs/DogCard";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your dogs and bookings.",
  robots: { index: false, follow: false },
};

export default async function CustomerDashboardPage() {
  const session = await auth();

  const dogs = session?.user
    ? await prisma.dog.findMany({
        where: { ownerId: session.user.id },
        orderBy: { createdAt: "asc" },
      })
    : [];

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
      </div>
    </div>
  );
}
