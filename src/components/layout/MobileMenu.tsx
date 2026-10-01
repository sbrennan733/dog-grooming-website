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

        {session?.user.role === "ADMIN" && (
          <Link
            href="/admin"
            onClick={closeMenu}
            aria-current={pathname.startsWith("/admin") ? "page" : undefined}
            className={`py-3 hover:text-black ${
              pathname.startsWith("/admin")
                ? "font-semibold text-black"
                : "text-gray-700"
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
            className="py-3 text-left text-gray-700 hover:text-black"
          >
            Log Out ({session.user.name})
          </button>
        ) : (
          <Link
            href="/login"
            onClick={closeMenu}
            className="py-3 text-gray-700 hover:text-black"
          >
            Login
          </Link>
        )}

      </div>
    </div>
  );
}
