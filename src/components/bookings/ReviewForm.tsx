"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import Button from "@/components/ui/Button";
import { inputClassName, labelClassName } from "@/components/ui/form-styles";
import { submitReview } from "@/app/customer/reviews/actions";

export default function ReviewForm({
  bookingId,
  dogName,
}: {
  bookingId: string;
  dogName: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    submitReview.bind(null, bookingId),
    undefined
  );
  const [rating, setRating] = useState(Number(state?.values?.rating) || 0);

  if (state?.success) {
    return (
      <p role="status" className="text-sm text-ok-ink">
        Thank you! Your review will appear on the website once it has been
        approved.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded px-2 py-2 text-sm font-bold text-brand hover:underline"
      >
        Leave a review
      </button>
    );
  }

  const ratingErrors = state?.errors?.rating;
  const commentErrors = state?.errors?.comment;

  return (
    <form
      action={formAction}
      className="mt-4 w-full space-y-4 rounded-2xl bg-surface-alt p-5"
    >
      <fieldset>
        <legend className={labelClassName}>
          How was {dogName}&apos;s groom?
        </legend>

        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="cursor-pointer rounded p-1">
              <input
                type="radio"
                name="rating"
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
                className="peer sr-only"
              />
              <Star
                size={28}
                aria-hidden="true"
                className={`peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand ${
                  value <= rating
                    ? "fill-accent text-accent"
                    : "fill-line text-line"
                }`}
              />
              <span className="sr-only">
                {value} {value === 1 ? "star" : "stars"}
              </span>
            </label>
          ))}
        </div>

        {ratingErrors?.length ? (
          <div role="alert">
            {ratingErrors.map((error) => (
              <p key={error} className="mt-1 text-sm text-danger">
                {error}
              </p>
            ))}
          </div>
        ) : null}
      </fieldset>

      <div>
        <label htmlFor={`comment-${bookingId}`} className={labelClassName}>
          Your review
        </label>

        <textarea
          id={`comment-${bookingId}`}
          name="comment"
          rows={4}
          required
          maxLength={1000}
          defaultValue={state?.values?.comment}
          aria-invalid={Boolean(commentErrors?.length)}
          aria-describedby={
            commentErrors?.length ? `comment-error-${bookingId}` : undefined
          }
          className={inputClassName}
        />

        {commentErrors?.length ? (
          <div id={`comment-error-${bookingId}`} role="alert">
            {commentErrors.map((error) => (
              <p key={error} className="mt-1 text-sm text-danger">
                {error}
              </p>
            ))}
          </div>
        ) : null}
      </div>

      {state?.message && (
        <p role="alert" className="text-sm text-danger">
          {state.message}
        </p>
      )}

      <p className="text-sm text-muted">
        If it&apos;s approved, your review will be shown on our website with
        your first name, the first letter of your surname and your dog&apos;s
        name. See our{" "}
        <Link href="/privacy" className="font-bold text-brand hover:underline">
          Privacy Notice
        </Link>
        .
      </p>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Sending..." : "Send review"}
        </Button>

        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
