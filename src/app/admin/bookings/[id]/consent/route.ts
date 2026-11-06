import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateConsentPdf } from "@/lib/consent";
import { BUSINESS_TIME_ZONE } from "@/lib/timezone";

// Downloads the signed consent form for a booking as a PDF. Admin only; the
// check is repeated here because route handlers can be called directly.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new Response("Not found", { status: 404 });
  }

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { user: true, dog: true, service: true, consent: true },
  });

  if (!booking?.consent) {
    return new Response("No consent form was signed for this booking.", {
      status: 404,
    });
  }

  const pdf = await generateConsentPdf(booking.consent, booking);

  const date = booking.scheduledAt.toLocaleDateString("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
  });
  const dog =
    booking.dog.name.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "") ||
    "dog";

  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="consent-${dog}-${date}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
