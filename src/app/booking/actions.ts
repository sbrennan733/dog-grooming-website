"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getAvailableDates, getAvailableSlots } from "@/lib/availability";
import { zonedWallTimeToUtc } from "@/lib/timezone";
import { priceForDog } from "@/lib/dog-size";
import { consentSchema } from "@/lib/validations/consent";
import { buildConsentSnapshot, generateConsentPdf } from "@/lib/consent";
import { buildConsentEmail } from "@/lib/email/consent-email";
import { sendEmail } from "@/lib/email/mailer";

export async function fetchAvailableSlots(
  date: string,
  serviceId: string
): Promise<string[]> {
  return getAvailableSlots(date, serviceId);
}

export async function fetchAvailableDates(serviceId: string): Promise<string[]> {
  return getAvailableDates(serviceId);
}

interface CreateBookingInput {
  dogId: string;
  serviceId: string;
  date: string;
  time: string;
  // The terms and consent agreed to (validated on the server).
  consent: unknown;
}

export async function createBooking(
  input: CreateBookingInput
): Promise<{ error: string } | void> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const account = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true },
  });
  if (!account?.emailVerified) {
    return { error: "Please confirm your email address before booking." };
  }

  const consentResult = consentSchema.safeParse(input.consent);
  if (!consentResult.success) {
    return {
      error:
        consentResult.error.issues[0]?.message ??
        "Please read the terms, tick the boxes and sign to continue.",
    };
  }
  const consent = consentResult.data;

  const dog = await prisma.dog.findUnique({ where: { id: input.dogId } });
  if (!dog || dog.ownerId !== session.user.id) {
    return { error: "That dog could not be found on your account." };
  }

  const service = await prisma.service.findUnique({
    where: { id: input.serviceId },
  });
  if (!service || !service.isActive) {
    return { error: "That service could not be found." };
  }

  const needsAssessment = !dog.assessmentCompletedAt;
  if (needsAssessment && !service.isAssessment) {
    return {
      error: `${dog.name} needs an assessment visit before other services can be booked.`,
    };
  }
  if (!needsAssessment && service.isAssessment) {
    return { error: `${dog.name} has already completed their assessment.` };
  }

  // Re-check the slot is still free — closes the race window between the
  // customer viewing available slots and actually submitting the booking.
  const availableSlots = await getAvailableSlots(input.date, input.serviceId);
  if (!availableSlots.includes(input.time)) {
    return {
      error: "That time is no longer available. Please choose another.",
    };
  }

  const scheduledAt = zonedWallTimeToUtc(input.date, input.time);

  // The booking and its signed consent are saved together or not at all.
  const booking = await prisma.booking.create({
    data: {
      userId: session.user.id,
      dogId: dog.id,
      serviceId: service.id,
      scheduledAt,
      priceAtBooking: priceForDog(service, dog).pence,
      depositAtBooking: service.deposit,
      consent: {
        create: {
          signedName: consent.signedName,
          termsVersion: consent.termsVersion,
          photoPermission: consent.photoPermission === "yes",
          snapshot: buildConsentSnapshot(consent.photoPermission),
        },
      },
    },
    include: { user: true, dog: true, service: true, consent: true },
  });

  // Email the business the signed form as a PDF record. The booking is
  // already saved, so a mail problem must not undo it (the form can still
  // be downloaded from the Admin area).
  try {
    if (booking.consent) {
      const pdf = await generateConsentPdf(booking.consent, booking);

      await sendEmail(
        buildConsentEmail({
          customerName: booking.user.name,
          customerEmail: booking.user.email,
          dogName: booking.dog.name,
          serviceName: booking.service.name,
          appointmentAt: booking.scheduledAt,
          photoPermission: booking.consent.photoPermission,
          pdf,
        })
      );
    }
  } catch (error) {
    console.error("Could not email the consent form:", error);
  }

  redirect("/booking/confirmation");
}
