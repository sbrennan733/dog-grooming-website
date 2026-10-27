import { headers } from "next/headers";

// The public base URL used for links we put in emails.
//
// In production this MUST come from configuration (AUTH_URL), never from the
// request's Host header. Otherwise someone could register with a victim's
// address while sending a forged Host header, and the victim would receive a
// genuine email from us containing a link to the attacker's site.
export async function getSiteUrl(): Promise<string> {
  const configured = process.env.AUTH_URL;
  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  // On Vercel the platform provides the production address itself (set by
  // Vercel, not by the request), so deployments work before AUTH_URL is set.
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelHost) {
    return `https://${vercelHost}`;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_URL must be set in production so emailed links point at the real site."
    );
  }

  // Development only: derive it from the request so any local port works.
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const isLocal = host.startsWith("localhost") || host.startsWith("127.");
  const protocol = isLocal
    ? "http"
    : (requestHeaders.get("x-forwarded-proto") ?? "http");

  return `${protocol}://${host}`;
}
