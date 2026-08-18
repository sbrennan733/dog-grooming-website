import Image from "next/image";
import { Check } from "lucide-react";

export default function About() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-6">

        {/* Section heading */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
            About Us
          </p>

          <h2 className="text-4xl font-bold text-gray-900 md:text-5xl">
            Caring For Your Best Friend
          </h2>
        </div>

        {/* Content */}
        <div className="grid items-center gap-12 md:grid-cols-2">

          {/* Image */}
          <div className="overflow-hidden rounded-3xl">
            <Image
              src="/images/dog.jpg"
              alt="Dog being groomed"
              width={600}
              height={600}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Information */}
          <div>
            <h3 className="mb-6 text-3xl font-bold text-gray-900">
              Meet Your Groomer
            </h3>

            <p className="mb-6 text-lg leading-relaxed text-gray-600">
              Welcome to Paws & Pamper. We provide friendly, professional
              grooming services designed to keep your dog looking and feeling
              their best.
            </p>

            <p className="mb-8 text-lg leading-relaxed text-gray-600">
              Every dog is treated as an individual, with their comfort,
              wellbeing and personality taken into consideration throughout
              their visit.
            </p>

            {/* Features */}
            <div className="space-y-4">

              {/* Professional Care */}
              <div className="flex items-start gap-3">
                <Check
                  size={20}
                  className="mt-1 shrink-0 text-gray-700"
                />

                <div>
                  <h4 className="font-semibold text-gray-900">
                    Professional Care
                  </h4>

                  <p className="text-gray-600">
                    A calm and caring approach tailored to every dog.
                  </p>
                </div>
              </div>

              {/* One-to-One Attention */}
              <div className="flex items-start gap-3">
                <Check
                  size={20}
                  className="mt-1 shrink-0 text-gray-700"
                />

                <div>
                  <h4 className="font-semibold text-gray-900">
                    One-to-One Attention
                  </h4>

                  <p className="text-gray-600">
                    Individual appointments so your dog receives dedicated
                    attention.
                  </p>
                </div>
              </div>

              {/* Dog-Focused Service */}
              <div className="flex items-start gap-3">
                <Check
                  size={20}
                  className="mt-1 shrink-0 text-gray-700"
                />

                <div>
                  <h4 className="font-semibold text-gray-900">
                    Dog-Focused Service
                  </h4>

                  <p className="text-gray-600">
                    We aim to make every grooming experience as comfortable
                    and stress-free as possible.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}