"use client";

import { useState } from "react";
import { cancelBooking } from "@/app/customer/bookings/actions";

export default function CancelBookingButton({
  bookingId,
}: {
  bookingId: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function handleConfirm() {
    setPending(true);
    setError(undefined);

    const result = await cancelBooking(bookingId);

    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded px-2 py-2 text-sm font-medium text-muted hover:text-brand hover:underline"
      >
        Cancel booking
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="text-muted">Cancel this booking?</span>

      <button
        type="button"
        onClick={handleConfirm}
        disabled={pending}
        className="rounded px-2 py-2 font-medium text-danger hover:underline disabled:opacity-50"
      >
        {pending ? "Cancelling..." : "Yes, cancel"}
      </button>

      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={pending}
        className="rounded px-2 py-2 font-medium text-muted hover:underline"
      >
        Keep it
      </button>

      {error && (
        <span role="alert" className="text-danger">
          {error}
        </span>
      )}
    </div>
  );
}
