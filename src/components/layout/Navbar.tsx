import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-2xl font-bold"
        >
          Paws & Pamper
        </Link>

        <div className="flex gap-6">
          <Link href="/">Home</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/booking">Book</Link>
        </div>
      </div>
    </nav>
  );
}