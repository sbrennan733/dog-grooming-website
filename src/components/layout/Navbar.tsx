import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-2xl font-bold text-gray-900"
        >
          Paws & Pamper
        </Link>

        <div className="flex gap-6">
          <Link
            href="/"
            className="text-gray-700 hover:text-black transition-colors"
          >
            Home
          </Link>

          <Link
            href="/gallery"
            className="text-gray-700 hover:text-black transition-colors"
          >
            Gallery
          </Link>

          <Link
            href="/booking"
            className="text-gray-700 hover:text-black transition-colors"
          >
            Book
          </Link>
        </div>
      </div>
    </nav>
  );
}