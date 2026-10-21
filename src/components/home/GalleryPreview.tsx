import Link from "next/link";
import BeforeAfterCard from "@/components/gallery/BeforeAfterCard";
import { beforeAfterPairs } from "@/data/gallery";

export default function GalleryPreview() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex items-center justify-between gap-4">
          <h2 className="text-4xl">Before &amp; after</h2>

          <Link
            href="/gallery"
            className="shrink-0 font-bold text-brand hover:underline"
          >
            View Full Gallery →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {beforeAfterPairs.slice(0, 2).map((pair) => (
            <BeforeAfterCard
              key={pair.id}
              pair={pair}
              sizes="(min-width: 768px) 25vw, 50vw"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
