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


export interface BeforeAfterPair {
  id: string;
  // Which way the original photos were taken; decides how they are cropped.
  orientation: "portrait" | "landscape";
  before: GalleryImage;
  after: GalleryImage;
}

export const beforeAfterPairs: BeforeAfterPair[] = [
  {
    id: "black-and-white",
    orientation: "portrait",
    before: {
      src: "/images/before-after/before-1.webp",
      alt: "Before: small black and white dog with a shaggy, untrimmed face and coat",
      width: 1500,
      height: 2000,
    },
    after: {
      src: "/images/before-after/after-1.webp",
      alt: "After: the same dog with a neat, rounded trim and a blue paw-print bandana",
      width: 1500,
      height: 2000,
    },
  },
  {
    id: "tan-and-white-long-coat",
    orientation: "landscape",
    before: {
      src: "/images/before-after/before-2.webp",
      alt: "Before: long-coated tan and white dog with a flat, tangled coat",
      width: 1530,
      height: 1280,
    },
    after: {
      src: "/images/before-after/after-2.webp",
      alt: "After: the same dog with a brushed-out, fluffy and full coat",
      width: 1530,
      height: 1169,
    },
  },
  {
    id: "cream-small-dog",
    orientation: "landscape",
    before: {
      src: "/images/before-after/before-3.webp",
      alt: "Before: small cream dog with a long, untidy coat",
      width: 1530,
      height: 890,
    },
    after: {
      src: "/images/before-after/after-3.webp",
      alt: "After: the same dog with a neat, even trim",
      width: 1530,
      height: 925,
    },
  },
  {
    id: "grey-curly-coat",
    orientation: "landscape",
    before: {
      src: "/images/before-after/before-4.webp",
      alt: "Before: grey dog with a long, curly and overgrown coat",
      width: 1530,
      height: 1084,
    },
    after: {
      src: "/images/before-after/after-4.webp",
      alt: "After: the same dog with a short, tidy trim",
      width: 1530,
      height: 917,
    },
  },
];
