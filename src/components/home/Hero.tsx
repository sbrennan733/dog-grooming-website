import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section className="bg-gray-50">
      <div className="mx-auto flex min-h-[80vh] max-w-7xl items-center gap-12 px-6">
        <div className="flex-1 max-w-xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Professional Dog Grooming
          </p>

          <h1 className="mb-6 text-5xl font-bold text-gray-900 md:text-7xl">
            Keeping Your Dog Looking Their Best
          </h1>

          <p className="mb-8 text-lg text-gray-600">
            Friendly, professional grooming services tailored to your dog's
            needs. From full grooms to nail trims, we help your furry friend
            look and feel amazing.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/booking">
              <Button> Book Appointment </Button>
            </Link>

            <Link href="/gallery">
              <Button variant="secondary">
              View Gallery
              </Button>
            </Link>
          </div>
        </div>


        <div className ="flex-1">
          <Image
            src="/images/dog.jpg"
            alt="Happy dog after grooming"
            width={600}
            height={600}
            priority
            className="w-full rounded-3xl object-cover shadow-xl"
          />
        </div>



      </div>
    </section>
  );
}