import Link from "next/link";
import type { Dog } from "@/generated/prisma/client";

interface DogCardProps {
  dog: Dog;
}

export default function DogCard({ dog }: DogCardProps) {
  const assessmentComplete = Boolean(dog.assessmentCompletedAt);

  return (
    <div className="rounded-2xl border p-6 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{dog.name}</h3>
          <p className="text-gray-600">
            {dog.breed} &middot; {dog.age} {dog.age === 1 ? "year" : "years"}{" "}
            old
          </p>
        </div>

        <Link
          href={`/customer/dogs/${dog.id}/edit`}
          className="shrink-0 text-sm font-medium text-gray-900 hover:underline"
        >
          Edit
        </Link>
      </div>

      <span
        className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
          assessmentComplete
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {assessmentComplete ? "Approved for Grooming" : "Assessment Required"}
      </span>

      {dog.notes && <p className="mt-3 text-sm text-gray-600">{dog.notes}</p>}
    </div>
  );
}
