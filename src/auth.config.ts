import type { NextAuthConfig } from "next-auth";

// Kept free of Prisma/bcrypt imports so it can run in the Proxy's edge
// bundle. The Credentials provider (which needs both) lives in auth.ts.
//
// The jwt/session callbacks live here (not just in auth.ts) because the
// Proxy creates its own NextAuth(authConfig) instance to decode the
// session cookie — without them here, auth.user.role would be undefined
// in the Proxy's `authorized` check even though the full auth.ts config
// sets it correctly.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const pathname = request.nextUrl.pathname;
      const isOnAdmin = pathname.startsWith("/admin");
      const isOnCustomer = pathname.startsWith("/customer");

      if (isOnAdmin) {
        return isLoggedIn && auth.user.role === "ADMIN";
      }

      if (isOnCustomer) {
        return isLoggedIn;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub as string;
      session.user.role = token.role;
      return session;
    },
  },
} satisfies NextAuthConfig;
