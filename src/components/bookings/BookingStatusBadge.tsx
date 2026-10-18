import type { BookingStatus } from "@/generated/prisma/client";

const STYLES: Record<BookingStatus, string> = {
  PENDING: "bg-warn-soft text-warn-ink",
  CONFIRMED: "bg-info-soft text-info-ink",
  COMPLETED: "bg-ok-soft text-ok-ink",
  CANCELLED: "bg-neutral-soft text-neutral-ink",
};

const LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default function BookingStatusBadge({
  status,
}: {
  status: BookingStatus;
}) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
