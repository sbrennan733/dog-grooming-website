import Image from "next/image";

const galleryImages = [
  "/images/gallery/dog2.jpg",
  "/images/gallery/dog3.jpg",
  "/images/gallery/dog4.jpg",
  "/images/gallery/dog5.jpg",
  "/images/gallery/dog6.jpg",
  "/images/gallery/dog7.jpg",
];

export default function GalleryPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-20">

      <h1 className="mb-12 text-center text-5xl font-bold">
        Our Work
      </h1>

      <div className="grid gap-6 md:grid-cols-3">
        {galleryImages.map((image) => (
          <div
            key={image}
            className="overflow-hidden rounded-2xl"
          >
            <Image
              src={image}
              alt="Dog Grooming"
              width={500}
              height={500}
              className="h-80 w-full object-cover transition duration-300 hover:scale-105"
            />
          </div>
        ))}
      </div>

    </main>
  );
}