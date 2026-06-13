export default function WhyChooseUs() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="mb-8 text-4xl text-gray-400 font-bold">
          Why Choose Us?
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-2 text-xl text-gray-400 font-semibold">
              Experienced Care
            </h3>

            <p className="text-gray-600">
              Gentle and professional grooming for every breed.
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-xl text-gray-400 font-semibold">
              Flexible Booking
            </h3>

            <p className="text-gray-600">
              Convenient appointments that fit your schedule.
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-xl text-gray-400 font-semibold">
              Happy Pets
            </h3>

            <p className="text-gray-600">
              Creating a stress-free experience for your furry friend.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}