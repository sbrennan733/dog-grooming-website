"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/mailer";
import { buildBookingStatusEmail } from "@/lib/email/booking-status-email";
import { priceForDog } from "@/lib/dog-size";
import { getSiteUrl } from "@/lib/site-url";

export type BookingDecision = "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface BookingDecisionResult {
  ok: boolean;
  // Shown to the admin after the change.
  message: string;
  // The status was saved but the customer could not be emailed.
  emailFailed?: boolean;
}

function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

// Confirming or cancelling emails the customer the booking details. Marking
// a past appointment completed moves it to the Past bookings tab (no email).
export async function setBookingStatus(
  bookingId: string,
  decision: BookingDecision
): Promise<BookingDecisionResult> {
  await requireAdmin();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, dog: true, service: true },
  });

  if (!booking) {
    return { ok: false, message: "That booking could not be found." };
  }

  const hasPassed = booking.scheduledAt <= new Date();
  const isOpen =
    booking.status === "PENDING" || booking.status === "CONFIRMED";

  // A cancelled booking frees its time for someone else, so it can't be
  // brought back (it could clash with a newer booking).
  if (decision === "CONFIRMED") {
    if (booking.status !== "PENDING") {
      return { ok: false, message: "Only pending bookings can be confirmed." };
    }
    if (hasPassed) {
      return { ok: false, message: "This appointment has already passed." };
    }
  }

  if (decision === "CANCELLED" && !isOpen) {
    return { ok: false, message: "This booking can no longer be cancelled." };
  }

  if (decision === "COMPLETED") {
    if (!isOpen) {
      return { ok: false, message: "This booking can't be marked completed." };
    }
    if (!hasPassed) {
      return {
        ok: false,
        message: "You can mark it completed once the appointment time has passed.",
      };
    }
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: decision },
  });

  revalidatePath("/admin");
  revalidatePath("/customer");
  revalidatePath("/booking");

  if (decision === "COMPLETED") {
    return { ok: true, message: "Marked completed and moved to Past bookings." };
  }

  // The status is saved first; a mail problem must not undo it.
  const customer = booking.user.email;
  try {
    let rebookUrl: string | undefined;
    try {
      rebookUrl = `${await getSiteUrl()}/booking`;
    } catch {
      rebookUrl = undefined;
    }

    const price = priceForDog(booking.service, booking.dog);

    await sendEmail(
      buildBookingStatusEmail({
        status: decision,
        to: customer,
        customerName: booking.user.name,
        dogName: booking.dog.name,
        serviceName: booking.service.name,
        scheduledAt: booking.scheduledAt,
        priceText: `${price.isFrom ? "from " : ""}${formatPrice(booking.priceAtBooking)}`,
        rebookUrl,
      })
    );
  } catch (error) {
    console.error("Could not send booking status email:", error);
    return {
      ok: true,
      emailFailed: true,
      message: `Saved as ${decision.toLowerCase()}, but the email to ${customer} could not be sent. Please let them know yourself.`,
    };
  }

  return {
    ok: true,
    message: `${decision === "CONFIRMED" ? "Confirmed" : "Cancelled"}. We emailed ${customer} the details.`,
  };
}

export async function markAssessmentComplete(dogId: string) {
  await requireAdmin();

  await prisma.dog.update({
    where: { id: dogId },
    data: { assessmentCompletedAt: new Date() },
  });

  revalidatePath("/admin");
}

export async function markContactMessageRead(messageId: string) {
  await requireAdmin();

  await prisma.contactMessage.update({
    where: { id: messageId },
    data: { isRead: true },
  });

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}
