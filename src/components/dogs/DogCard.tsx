import Link from "next/link";
import type { Dog } from "@/generated/prisma/client";
import { dogSizeLabels } from "@/lib/dog-size";

interface DogCardProps {
  dog: Dog;
}

export default function DogCard({ dog }: DogCardProps) {
  const assessmentComplete = Boolean(dog.assessmentCompletedAt);

  return (
    <div className="rounded-3xl bg-surface p-6 shadow-soft">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl text-ink">{dog.name}</h3>
          <p className="text-muted">
            {dog.breed} &middot; {dogSizeLabels[dog.size]} &middot; {dog.age}{" "}
            {dog.age === 1 ? "year" : "years"} old
          </p>
        </div>

        <Link
          href={`/customer/dogs/${dog.id}/edit`}
          className="-mr-2 -mt-1 shrink-0 rounded px-2 py-2 text-sm font-bold text-brand hover:underline"
        >
          Edit
        </Link>
      </div>

      <span
        className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
          assessmentComplete
            ? "bg-ok-soft text-ok-ink"
            : "bg-warn-soft text-warn-ink"
        }`}
      >
        {assessmentComplete ? "Approved for Grooming" : "Assessment Required"}
      </span>

      {dog.notes && <p className="mt-3 text-sm text-muted">{dog.notes}</p>}
    </div>
  );
}
