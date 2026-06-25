import Link from "next/link";

interface MobileMenuProps {
  isOpen: boolean;
  closeMenu: () => void;
}

export default function MobileMenu({
  isOpen,
  closeMenu,
}: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="border-t bg-white md:hidden">
      <div className="flex flex-col px-6 py-4">

        <Link
          href="/"
          onClick={closeMenu}
          className="py-3 text-gray-700 hover:text-black"
        >
          Home
        </Link>

        <Link
          href="/gallery"
          onClick={closeMenu}
          className="py-3 text-gray-700 hover:text-black"
        >
          Gallery
        </Link>

        <Link
          href="/booking"
          onClick={closeMenu}
          className="py-3 text-gray-700 hover:text-black"
        >
          Book
        </Link>

      </div>
    </div>
  );
}