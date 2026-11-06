import { Star } from "lucide-react";
import { getPublicReviews } from "@/lib/reviews";

// Shows only reviews the owner has approved. Until the first one is approved
// the whole section is left out, so the page never shows invented reviews.
export default async function Testimonials() {
  const { reviews, count, average } = await getPublicReviews();

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="bg-surface-alt py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-4xl text-ink">What Our Customers Say</h2>

          <p className="text-muted">
            Rated {average.toFixed(1)} out of 5 from {count}{" "}
            {count === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Flex rather than a grid, so one or two reviews sit in the middle. */}
        <div className="flex flex-wrap justify-center gap-8">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="flex w-full flex-col rounded-3xl bg-surface p-8 shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-lift md:w-[22rem]"
            >
              <div className="mb-4 flex gap-1" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={18}
                    className={
                      index < review.rating
                        ? "fill-accent text-accent"
                        : "fill-line text-line"
                    }
                  />
                ))}
              </div>

              <p className="sr-only">{review.rating} out of 5 stars.</p>

              <p className="mb-6 flex-1 whitespace-pre-wrap text-muted [overflow-wrap:anywhere]">
                &ldquo;{review.comment}&rdquo;
              </p>

              <p className="font-semibold text-ink">{review.reviewer}</p>

              <p className="text-sm text-muted">Owner of {review.dogName}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
