"use client";

import { useState, ChangeEvent } from "react";
import { updateBookingStatus } from "@/app/admin/actions";
import type { BookingStatus } from "@/generated/prisma/client";

const STATUSES: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
];

function formatLabel(status: BookingStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

interface BookingStatusSelectProps {
  bookingId: string;
  status: BookingStatus;
  label: string;
}

export default function BookingStatusSelect({
  bookingId,
  status,
  label,
}: BookingStatusSelectProps) {
  const [pending, setPending] = useState(false);

  async function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    setPending(true);
    await updateBookingStatus(bookingId, event.target.value as BookingStatus);
    setPending(false);
  }

  return (
    <select
      aria-label={`Status for ${label}`}
      defaultValue={status}
      onChange={handleChange}
      disabled={pending}
      className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-900 disabled:opacity-50"
    >
      {STATUSES.map((value) => (
        <option key={value} value={value}>
          {formatLabel(value)}
        </option>
      ))}
    </select>
  );
}
