"use client";

import { useState, useTransition } from "react";
import { deleteExpiredCustomer } from "@/app/admin/retention/actions";

interface DeleteCustomerButtonProps {
  userId: string;
  customerName: string;
}

const buttonBase =
  "rounded-full px-4 py-1.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60";

export default function DeleteCustomerButton({
  userId,
  customerName,
}: DeleteCustomerButtonProps) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [problem, setProblem] = useState<string>();

  function remove() {
    setProblem(undefined);

    startTransition(async () => {
      const result = await deleteExpiredCustomer(userId);
      // On success the row disappears when the page refreshes, so only a
      // failure needs showing.
      if (!result.ok) {
        setProblem(result.message);
        setConfirming(false);
      }
    });
  }

  return (
    <div className="space-y-2">
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          aria-label={`Delete all records for ${customerName}`}
          className={`${buttonBase} border-2 border-danger text-danger hover:bg-danger-soft`}
        >
          Delete
        </button>
      ) : (
        <div
          role="group"
          aria-label={`Confirm deleting ${customerName}`}
          className="space-y-2 rounded-xl bg-surface p-3 text-sm"
        >
          <p className="text-ink">
            Permanently delete {customerName}&apos;s account, dogs, bookings
            and signed consent forms? This can&apos;t be undone.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className={`${buttonBase} bg-danger text-on-brand hover:opacity-90`}
            >
              {pending ? "Deleting..." : "Yes, delete"}
            </button>

            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={pending}
              className={`${buttonBase} border-2 border-line-input text-ink hover:bg-surface-alt`}
            >
              Keep
            </button>
          </div>
        </div>
      )}

      {problem && (
        <p role="alert" className="text-sm text-danger-ink">
          {problem}
        </p>
      )}
    </div>
  );
}
