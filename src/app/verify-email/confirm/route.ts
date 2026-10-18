import { NextResponse, type NextRequest } from "next/server";
import { verifyEmailToken } from "@/lib/email-verification";
import { getSiteUrl } from "@/lib/site-url";

// The emailed link points here. It verifies the token, then redirects to a
// result page so the token is not left sitting in the address bar/history.
export async function GET(request: NextRequest) {
  const status = await verifyEmailToken(
    request.nextUrl.searchParams.get("token")
  );

  const destination = new URL(
    `/verify-email?status=${status}`,
    await getSiteUrl()
  );

  const response = NextResponse.redirect(destination);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");

  return response;
}
