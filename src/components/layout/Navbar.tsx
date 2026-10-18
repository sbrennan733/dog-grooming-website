"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, PawPrint, X } from "lucide-react";

import MobileMenu from "./MobileMenu";
import ButtonLink from "@/components/ui/ButtonLink";
import { businessInfo } from "@/data/business";
import { navLinks } from "@/data/navigation";

function linkClassName(isActive: boolean): string {
  const base =
    "relative py-1 font-semibold transition-colors hover:text-brand";
  const active =
    "text-ink after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-accent";

  return `${base} ${isActive ? active : "text-muted"}`;
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <nav
      aria-label="Main"
      className="sticky top-0 z-50 border-b border-line bg-background/90 backdrop-blur"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 whitespace-nowrap font-heading text-xl font-semibold text-ink sm:gap-2.5 sm:text-2xl"
        >
          <PawPrint
            size={28}
            aria-hidden="true"
            className="text-brand"
            fill="currentColor"
          />
          {businessInfo.name}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={linkClassName(pathname === link.href)}
            >
              {link.label}
            </Link>
          ))}

          {session?.user.role === "ADMIN" && (
            <Link
              href="/admin"
              aria-current={pathname.startsWith("/admin") ? "page" : undefined}
              className={linkClassName(pathname.startsWith("/admin"))}
            >
              Admin
            </Link>
          )}

          {status === "loading" ? (
            // Same footprint as the button, so the nav does not jump or flash
            // "Log in" at a signed-in user while the session is being read.
            <span aria-hidden="true" className="inline-block h-9 w-24" />
          ) : status === "authenticated" ? (
            <>
              <span className="font-semibold text-ink">{session.user.name}</span>
              <button
                onClick={() => signOut()}
                className="rounded-full border-2 border-line px-5 py-2 text-sm font-bold text-ink transition hover:bg-surface-alt"
              >
                Log out
              </button>
            </>
          ) : (
            <ButtonLink href="/login" className="px-6 py-2 text-sm">
              Log in
            </ButtonLink>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="rounded-full p-2.5 text-ink transition-colors hover:bg-surface-alt md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
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
