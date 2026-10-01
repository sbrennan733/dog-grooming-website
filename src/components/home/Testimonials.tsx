import { Star } from "lucide-react";
import { testimonials } from "@/data/testimonials";

export default function Testimonials() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 text-center text-4xl font-bold text-gray-400">
          What Our Customers Say
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="rounded-2xl border bg-white p-8 shadow-sm transition hover:shadow-lg"
            >
              <div className="mb-4 flex gap-1" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={18}
                    className={
                      index < testimonial.rating
                        ? "fill-black text-black"
                        : "fill-gray-200 text-gray-200"
                    }
                  />
                ))}
              </div>

              <p className="sr-only">{testimonial.rating} out of 5 stars.</p>

              <p className="mb-6 text-gray-600">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              <p className="font-semibold text-gray-900">
                {testimonial.customerName}
              </p>

              <p className="text-sm text-gray-500">
                Owner of {testimonial.dogName}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
