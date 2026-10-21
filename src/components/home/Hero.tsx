import Image from "next/image";
import ButtonLink from "@/components/ui/ButtonLink";
import { galleryImages } from "@/data/gallery";

const heroImage = galleryImages[1];

export default function Hero() {
  return (
    <section className="overflow-hidden bg-background">
      <div className="mx-auto flex min-h-[80vh] max-w-7xl flex-col gap-14 px-6 py-16 md:flex-row md:items-center">
        <div className="max-w-xl flex-1 text-center md:text-left">
          <p className="mb-5 inline-block rounded-full bg-accent-soft px-4 py-1.5 text-sm font-bold text-accent-ink">
            Professional dog grooming
          </p>

          <h1 className="mb-6 text-5xl leading-[1.08] text-ink md:text-6xl lg:text-7xl">
            Keeping your dog looking their best
          </h1>

          <p className="mb-8 text-lg leading-relaxed text-muted">
            Friendly, professional grooming services tailored to your
            dog&apos;s needs. From full grooms to nail trims, we help your furry
            friend look and feel amazing.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row md:justify-start">
            <ButtonLink href="/booking">Book appointment</ButtonLink>

            <ButtonLink href="/gallery" variant="secondary">
              View gallery
            </ButtonLink>
          </div>
        </div>

        <div className="relative flex-1">
          <div
            aria-hidden="true"
            className="absolute -inset-4 translate-x-5 translate-y-[-1rem] rotate-3 rounded-[2.75rem] bg-accent-soft"
          />

          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            width={heroImage.width}
            height={heroImage.height}
            sizes="(min-width: 768px) 50vw, 448px"
            priority
            className="relative mx-auto aspect-[4/5] w-full max-w-md rounded-[2.25rem] object-cover object-[50%_20%] shadow-lift md:max-w-full"
          />
        </div>
      </div>
    </section>
  );
}
