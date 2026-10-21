"use client";

import { useState, useTransition } from "react";
import { setBookingStatus, type BookingDecision } from "@/app/admin/actions";
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import type { BookingStatus } from "@/generated/prisma/client";

interface BookingActionsProps {
  bookingId: string;
  status: BookingStatus;
  // True once the appointment time has passed.
  hasPassed: boolean;
  customerName: string;
  customerEmail: string;
  dogName: string;
}

const buttonBase =
  "rounded-full px-4 py-1.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60";

export default function BookingActions({
  bookingId,
  status,
  hasPassed,
  customerName,
  customerEmail,
  dogName,
}: BookingActionsProps) {
  const [pending, startTransition] = useTransition();
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string }>();

  const label = `${customerName}, ${dogName}`;

  function decide(decision: BookingDecision) {
    setConfirmingCancel(false);
    setResult(undefined);

    startTransition(async () => {
      setResult(await setBookingStatus(bookingId, decision));
    });
  }

  const canConfirm = status === "PENDING" && !hasPassed;
  const canCancel = status === "PENDING" || status === "CONFIRMED";
  const canComplete =
    (status === "PENDING" || status === "CONFIRMED") && hasPassed;

  return (
    <div className="space-y-2">
      <BookingStatusBadge status={status} />

      {(canConfirm || canCancel || canComplete) && (
        <div className="flex flex-wrap gap-2">
          {canConfirm && (
            <button
              type="button"
              onClick={() => decide("CONFIRMED")}
              disabled={pending}
              aria-label={`Confirm booking for ${label}`}
              className={`${buttonBase} bg-ok-ink text-on-brand hover:opacity-90`}
            >
              Confirm
            </button>
          )}

          {canComplete && (
            <button
              type="button"
              onClick={() => decide("COMPLETED")}
              disabled={pending}
              aria-label={`Mark booking for ${label} as completed`}
              className={`${buttonBase} bg-brand text-on-brand hover:bg-brand-hover`}
            >
              Mark completed
            </button>
          )}

          {canCancel && !confirmingCancel && (
            <button
              type="button"
              onClick={() => setConfirmingCancel(true)}
              disabled={pending}
              aria-label={`Cancel booking for ${label}`}
              className={`${buttonBase} border-2 border-danger text-danger hover:bg-danger-soft`}
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {confirmingCancel && (
        <div
          role="group"
          aria-label={`Confirm cancelling the booking for ${label}`}
          className="space-y-2 rounded-xl bg-surface p-3 text-sm"
        >
          <p className="text-ink">
            Cancel this booking and email {customerEmail}?
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => decide("CANCELLED")}
              disabled={pending}
              className={`${buttonBase} bg-danger text-on-brand hover:opacity-90`}
            >
              Yes, cancel it
            </button>

            <button
              type="button"
              onClick={() => setConfirmingCancel(false)}
              disabled={pending}
              className={`${buttonBase} border-2 border-line-input text-ink hover:bg-surface-alt`}
            >
              Keep it
            </button>
          </div>
        </div>
      )}

      {pending && (
        <p role="status" className="text-sm text-muted">
          Saving...
        </p>
      )}

      {result && !pending && (
        <p
          role={result.ok ? "status" : "alert"}
          className={`text-sm ${result.ok ? "text-ok-ink" : "text-danger-ink"}`}
        >
          {result.message}
        </p>
      )}
    </div>
  );
}
