const services = [
  {
    title: "Full Groom",
    description:
      "Complete grooming package including wash, trim, styling and drying.",
    price: "£40",
  },
  {
    title: "Wash & Dry",
    description:
      "Freshen up your dog with a professional wash and blow dry.",
    price: "£20",
  },
  {
    title: "Nail Trim",
    description:
      "Quick and safe nail trimming to keep paws healthy.",
    price: "£10",
  },
];

export default function Services() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 text-center text-4xl text-gray-400 font-bold">
          Our Services
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-2xl  border p-8 shadow-sm transition hover:shadow-lg"
            >
              <h3 className="mb-4 text-2xl text-gray-400 font-semibold">
                {service.title}
              </h3>

              <p className="mb-6 text-gray-600">
                {service.description}
              </p>

              <p className="text-xl text-gray-600 font-bold">
                {service.price}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}