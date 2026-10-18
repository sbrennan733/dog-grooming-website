import { services } from "@/data/services";

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

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex flex-col rounded-3xl bg-surface p-8 shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-lift"
            >
              <h3 className="mb-3 text-2xl text-ink">{service.name}</h3>

              <p className="mb-6 flex-1 text-muted">{service.description}</p>

              <div>
                <p className="font-heading text-3xl font-semibold text-brand">
                  £{service.price.toFixed(2)}
                </p>
                <p className="text-sm text-muted">
                  About {service.duration} minutes
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
