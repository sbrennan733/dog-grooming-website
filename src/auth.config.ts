import type { NextAuthConfig } from "next-auth";

// Kept free of Prisma/bcrypt imports so it can run in the Proxy's edge
// bundle. The Credentials provider (which needs both) lives in auth.ts.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = request.nextUrl.pathname.startsWith("/admin");

      if (isOnAdmin) {
        return isLoggedIn && auth.user.role === "ADMIN";
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
