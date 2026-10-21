import Link from "next/link";
import { priceDisclaimer, publicServices } from "@/data/services";

const sizeLabels = [
  { key: "small", label: "Small" },
  { key: "medium", label: "Medium" },
  { key: "large", label: "Large" },
] as const;

export default function Services() {
  return (
    <section className="bg-surface-alt py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-4xl text-ink md:text-5xl">Our services</h2>
          <p className="mx-auto max-w-xl text-lg text-muted">
            Simple, transparent pricing for every kind of groom.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {publicServices.map((service) => (
            <div
              key={service.id}
              className="flex flex-col rounded-3xl bg-surface p-8 shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-lift"
            >
              <h3 className="mb-3 text-2xl text-ink">{service.name}</h3>

              <p className="mb-6 flex-1 text-muted">{service.description}</p>

              {service.isFromPrice ? (
                <p className="font-heading text-3xl font-semibold text-brand">
                  From £{service.prices.small}
                </p>
              ) : (
                <dl className="grid grid-cols-3 gap-2 text-center">
                  {sizeLabels.map(({ key, label }) => (
                    <div
                      key={key}
                      className="rounded-2xl bg-surface-alt px-2 py-3"
                    >
                      <dt className="text-sm text-muted">{label}</dt>
                      <dd className="font-heading text-2xl font-semibold text-brand">
                        £{service.prices[key]}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {service.priceNote && (
                <p className="mt-3 text-sm text-muted">{service.priceNote}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted">
          <p className="mb-2">{priceDisclaimer}</p>
          <p>
            Unsure which size category your dog falls into?{" "}
            <Link
              href="/contact"
              className="font-bold text-brand hover:underline"
            >
              Please message us.
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
