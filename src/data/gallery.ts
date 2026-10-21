export interface GalleryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

// Real photos of dogs groomed by the business.
export const galleryImages: GalleryImage[] = [
  {
    src: "/images/dogs/fluffy-cream-dog.webp",
    alt: "Fluffy cream-coloured dog freshly groomed, standing on the grooming table",
    width: 1210,
    height: 1750,
  },
  {
    src: "/images/dogs/husky.webp",
    alt: "Husky with a clean, fluffy coat sitting on the grooming table",
    width: 1145,
    height: 1750,
  },
  {
    src: "/images/dogs/white-dog-in-car.webp",
    alt: "White dog with a red collar sitting in a car boot after being groomed",
    width: 1500,
    height: 2000,
  },
];
