import type { Metadata } from "next";
import Image from "next/image";
import { galleryImages } from "@/data/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse photos of dogs we've groomed.",
};

export default function GalleryPage() {
  return (
    <div className="bg-background px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-12 text-center text-5xl text-ink">
          Our Work
        </h1>

        <div className="grid gap-6 md:grid-cols-3">
          {galleryImages.map((image, index) => (
            <div
              key={image}
              className="overflow-hidden rounded-3xl shadow-soft"
            >
              <Image
                src={image}
                alt={`Groomed dog, photo ${index + 1}`}
                width={500}
                height={500}
                className="h-80 w-full object-cover transition duration-300 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
