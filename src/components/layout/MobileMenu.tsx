"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navLinks } from "@/data/navigation";

interface MobileMenuProps {
  isOpen: boolean;
  closeMenu: () => void;
}

export default function MobileMenu({
  isOpen,
  closeMenu,
}: MobileMenuProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="border-t bg-white md:hidden">
      <div className="flex flex-col px-6 py-4">

        {navLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              aria-current={isActive ? "page" : undefined}
              className={`py-3 hover:text-black ${
                isActive ? "font-semibold text-black" : "text-gray-700"
              }`}
            >
              {link.label}
            </Link>
          );
        })}

      </div>
    </div>
  );
}
