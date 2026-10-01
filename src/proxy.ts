import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Renamed from `middleware.ts` to `proxy.ts` in Next.js 16 — same mechanism.
// Uses the edge-safe authConfig (no Prisma/bcrypt) rather than the full
// config in auth.ts, per NextAuth's recommended split for Proxy/Middleware.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*", "/customer/:path*"],
};
