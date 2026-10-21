import Image from "next/image";
import Link from "next/link";
import { galleryImages } from "@/data/gallery";

export default function GalleryPreview() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex items-center justify-between">
          <h2 className="text-4xl">
            Gallery
          </h2>

          <Link
            href="/gallery"
            className="font-bold text-brand hover:underline"
          >
            View Full Gallery →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {galleryImages.slice(0, 3).map((image) => (
            <div
              key={image.src}
              className="overflow-hidden rounded-3xl shadow-soft"
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="aspect-[3/4] w-full object-cover transition duration-300 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}