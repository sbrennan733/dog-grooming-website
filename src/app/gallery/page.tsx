import type { Metadata } from "next";
import Image from "next/image";
import BeforeAfterCard from "@/components/gallery/BeforeAfterCard";
import { beforeAfterPairs, galleryImages } from "@/data/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Before and after photos of dogs we've groomed.",
};

export default function GalleryPage() {
  return (
    <div className="bg-background px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-center text-5xl text-ink">Our Work</h1>

        <p className="mx-auto mb-12 max-w-xl text-center text-lg text-muted">
          Real dogs, real results. Here&apos;s how some of our regulars looked
          when they arrived, and how they left.
        </p>

        <h2 className="mb-6 text-3xl text-ink">Before &amp; after</h2>

        <div className="grid gap-6 md:grid-cols-2">
          {beforeAfterPairs.map((pair) => (
            <BeforeAfterCard
              key={pair.id}
              pair={pair}
              sizes="(min-width: 768px) 25vw, 50vw"
            />
          ))}
        </div>

        <h2 className="mb-6 mt-16 text-3xl text-ink">More fresh faces</h2>

        <div className="grid gap-6 md:grid-cols-3">
          {galleryImages.map((image) => (
            <div
              key={image.src}
              className="overflow-hidden rounded-3xl shadow-soft"
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="(min-width: 768px) 33vw, 100vw"
                className="aspect-[3/4] w-full object-cover transition duration-300 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
