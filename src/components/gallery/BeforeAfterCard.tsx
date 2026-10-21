import Image from "next/image";
import type { BeforeAfterPair } from "@/data/gallery";

// Every pair is shown in the same 3:2 frame so cards in a row match. Tall
// photos are cropped around the dog's face rather than the middle.
const orientationClasses = {
  portrait: "aspect-[3/2] object-[50%_38%]",
  landscape: "aspect-[3/2] object-center",
} as const;

function Photo({
  image,
  label,
  orientation,
  sizes,
}: {
  image: BeforeAfterPair["before"];
  label: "Before" | "After";
  orientation: BeforeAfterPair["orientation"];
  sizes: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes={sizes}
        className={`${orientationClasses[orientation]} w-full object-cover`}
      />

      {/* The alt text already starts with "Before:" / "After:". */}
      <span
        aria-hidden="true"
        className="absolute left-2 top-2 rounded-full bg-ink/85 px-2 py-0.5 text-xs font-bold text-on-brand sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-sm"
      >
        {label}
      </span>
    </div>
  );
}

export default function BeforeAfterCard({
  pair,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 50vw",
}: {
  pair: BeforeAfterPair;
  sizes?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-3xl bg-surface p-3 shadow-soft">
      <Photo
        image={pair.before}
        label="Before"
        orientation={pair.orientation}
        sizes={sizes}
      />
      <Photo
        image={pair.after}
        label="After"
        orientation={pair.orientation}
        sizes={sizes}
      />
    </div>
  );
}
