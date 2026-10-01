"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import MobileMenu from "./MobileMenu";
import { navLinks } from "@/data/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold text-gray-900"
        >
          Paws & Pamper
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden gap-6 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`transition-colors hover:text-black ${
                  isActive ? "font-semibold text-black" : "text-gray-700"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 md:hidden"
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

      </div>

      <MobileMenu
        isOpen={isMenuOpen}
        closeMenu={() => setIsMenuOpen(false)}
      />
    </nav>
  );
}
