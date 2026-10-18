"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

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
  const { data: session, status } = useSession();

  if (!isOpen) return null;

  return (
    <div id="mobile-menu" className="border-t border-line bg-background md:hidden">
      <div className="flex flex-col px-6 py-4">

        {navLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              aria-current={isActive ? "page" : undefined}
              className={`py-3.5 text-lg hover:text-brand ${
                isActive ? "font-bold text-ink" : "text-muted"
              }`}
            >
              {link.label}
            </Link>
          );
        })}

        {session?.user.role === "ADMIN" && (
          <Link
            href="/admin"
            onClick={closeMenu}
            aria-current={pathname.startsWith("/admin") ? "page" : undefined}
            className={`py-3.5 text-lg hover:text-brand ${
              pathname.startsWith("/admin")
                ? "font-bold text-ink"
                : "text-muted"
            }`}
          >
            Admin
          </Link>
        )}

        {status === "authenticated" ? (
          <button
            onClick={() => {
              closeMenu();
              signOut();
            }}
            className="py-3.5 text-left text-lg text-muted hover:text-brand"
          >
            Log out ({session.user.name})
          </button>
        ) : (
          <Link
            href="/login"
            onClick={closeMenu}
            className="py-3.5 text-lg font-bold text-brand"
          >
            Log in
          </Link>
        )}

      </div>
    </div>
  );
}
