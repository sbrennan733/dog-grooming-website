import Image from "next/image";
import { Check } from "lucide-react";
import { businessInfo } from "@/data/business";
import { galleryImages } from "@/data/gallery";

const aboutImage = galleryImages[1];

export default function About() {
  return (
    <section className="bg-surface-alt py-24">
      <div className="mx-auto max-w-7xl px-6">

        {/* Section heading */}
        <div className="mb-16 text-center">
          <p className="mb-4 inline-block rounded-full bg-accent-soft px-4 py-1.5 text-sm font-bold text-accent-ink">
            About us
          </p>

          <h2 className="text-4xl text-ink md:text-5xl">
            Caring For Your Best Friend
          </h2>
        </div>

        {/* Content */}
        <div className="grid items-center gap-12 md:grid-cols-2">

          {/* Image */}
          <div className="overflow-hidden rounded-[2.25rem] shadow-lift">
            <Image
              src={aboutImage.src}
              alt={aboutImage.alt}
              width={aboutImage.width}
              height={aboutImage.height}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>

          {/* Information */}
          <div>
            <h3 className="mb-6 text-3xl text-ink">
              Meet Your Groomer
            </h3>

            <p className="mb-6 text-lg leading-relaxed text-muted">
              Welcome to {businessInfo.name}. We provide friendly, professional
              grooming services designed to keep your dog looking and feeling
              their best.
            </p>

            <p className="mb-8 text-lg leading-relaxed text-muted">
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
                  className="mt-1 shrink-0 text-brand"
                />

                <div>
                  <h4 className="text-ink">
                    Professional Care
                  </h4>

                  <p className="text-muted">
                    A calm and caring approach tailored to every dog.
                  </p>
                </div>
              </div>

              {/* One-to-One Attention */}
              <div className="flex items-start gap-3">
                <Check
                  size={20}
                  className="mt-1 shrink-0 text-brand"
                />

                <div>
                  <h4 className="text-ink">
                    One-to-One Attention
                  </h4>

                  <p className="text-muted">
                    Individual appointments so your dog receives dedicated
                    attention.
                  </p>
                </div>
              </div>

              {/* Dog-Focused Service */}
              <div className="flex items-start gap-3">
                <Check
                  size={20}
                  className="mt-1 shrink-0 text-brand"
                />

                <div>
                  <h4 className="text-ink">
                    Dog-Focused Service
                  </h4>

                  <p className="text-muted">
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