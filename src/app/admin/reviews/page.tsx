import type { Metadata } from "next";
import { Star } from "lucide-react";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { setReviewStatus } from "@/app/admin/reviews/actions";
import { reviewerName } from "@/lib/reviews";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import { BUSINESS_TIME_ZONE } from "@/lib/timezone";
import type { ReviewStatus } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Approve or hide customer reviews.",
  robots: { index: false, follow: false },
};

const STATUS_LABELS: Record<ReviewStatus, string> = {
  PENDING: "Waiting for approval",
  APPROVED: "Showing on the website",
  HIDDEN: "Hidden",
};

export default async function AdminReviewsPage() {
  await requireAdmin();

  const reviews = await prisma.review.findMany({
    include: {
      user: { select: { name: true, email: true } },
      booking: { select: { dog: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // Anything waiting for a decision goes first.
  const sorted = [
    ...reviews.filter((review) => review.status === "PENDING"),
    ...reviews.filter((review) => review.status !== "PENDING"),
  ];

  return (
    <div className="bg-background px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl text-ink">Reviews</h1>

          <ButtonLink href="/admin" variant="secondary">
            Back to Bookings
          </ButtonLink>
        </div>

        <div className="mb-8 space-y-3 text-muted">
          <p>
            Only customers whose appointment is marked Completed can leave a
            review. Nothing shows on the website until you approve it, and
            you can&apos;t change the words, only show or hide a review.
          </p>
          <p>
            Please only hide a review that is abusive, spam, or isn&apos;t
            about your service. It is against the law to hide reviews just
            because they are critical, or to show only the best ones.
          </p>
        </div>

        {sorted.length === 0 ? (
          <p role="status" className="text-muted">
            No reviews yet. Customers can leave one from their account after
            an appointment is marked Completed.
          </p>
        ) : (
          <ul className="space-y-4">
            {sorted.map((review) => (
              <li
                key={review.id}
                className={`rounded-2xl p-6 shadow-soft ${
                  review.status === "PENDING" ? "bg-surface-alt" : "bg-surface"
                }`}
              >
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex gap-1" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={value}
                        size={18}
                        className={
                          value <= review.rating
                            ? "fill-accent text-accent"
                            : "fill-line text-line"
                        }
                      />
                    ))}
                  </div>
                  <p className="sr-only">{review.rating} out of 5 stars.</p>

                  <p className="text-sm text-muted">
                    {review.createdAt.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      timeZone: BUSINESS_TIME_ZONE,
                    })}
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${
                        review.status === "PENDING"
                          ? "bg-brand text-on-brand"
                          : "bg-line text-ink"
                      }`}
                    >
                      {STATUS_LABELS[review.status]}
                    </span>
                  </p>
                </div>

                <p className="mb-3 text-sm text-muted [overflow-wrap:anywhere]">
                  {review.user.name} ({review.user.email}), owner of{" "}
                  {review.booking.dog.name}. Shown as{" "}
                  <strong className="text-ink">
                    {reviewerName(review.user.name)}
                  </strong>
                  .
                </p>

                <p className="whitespace-pre-wrap text-ink [overflow-wrap:anywhere]">
                  {review.comment}
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  {review.status !== "APPROVED" && (
                    <form
                      action={setReviewStatus.bind(null, review.id, "APPROVED")}
                    >
                      <Button type="submit">Approve</Button>
                    </form>
                  )}

                  {review.status !== "HIDDEN" && (
                    <form
                      action={setReviewStatus.bind(null, review.id, "HIDDEN")}
                    >
                      <Button type="submit" variant="secondary">
                        Hide
                      </Button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
