import { Star } from "lucide-react";
import { testimonials } from "@/data/testimonials";

export default function Testimonials() {
  return (
    <section className="bg-surface-alt py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 text-center text-4xl text-ink">
          What Our Customers Say
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="flex flex-col rounded-3xl bg-surface p-8 shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="mb-4 flex gap-1" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={18}
                    className={
                      index < testimonial.rating
                        ? "fill-accent text-accent"
                        : "fill-line text-line"
                    }
                  />
                ))}
              </div>

              <p className="sr-only">{testimonial.rating} out of 5 stars.</p>

              <p className="mb-6 flex-1 text-muted">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              <p className="font-semibold text-ink">
                {testimonial.customerName}
              </p>

              <p className="text-sm text-muted">
                Owner of {testimonial.dogName}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
