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
        className="rounded px-2 py-2 text-sm font-medium text-gray-700 hover:text-black hover:underline"
      >
        Cancel booking
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="text-gray-700">Cancel this booking?</span>

      <button
        type="button"
        onClick={handleConfirm}
        disabled={pending}
        className="rounded px-2 py-2 font-medium text-red-700 hover:underline disabled:opacity-50"
      >
        {pending ? "Cancelling..." : "Yes, cancel"}
      </button>

      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={pending}
        className="rounded px-2 py-2 font-medium text-gray-700 hover:underline"
      >
        Keep it
      </button>

      {error && (
        <span role="alert" className="text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
