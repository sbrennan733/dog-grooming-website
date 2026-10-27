import { businessInfo } from "@/data/business";
import {
  consentSections,
  photoConsentOptions,
  termsPoints,
  type PhotoConsent,
} from "@/data/consent";
import { buildConsentPdf, type ConsentSnapshot } from "@/lib/consent-pdf";
import type { ConsentRecord } from "@/generated/prisma/client";

// Freezes the wording as it is right now, to be saved with the booking.
export function buildConsentSnapshot(photoPermission: PhotoConsent): ConsentSnapshot {
  return {
    terms: termsPoints.map((point) => ({
      heading: point.heading,
      text: point.text,
    })),
    agreed: consentSections.map((section) => ({
      heading: section.heading,
      statements: section.statements.map((statement) => statement.text),
    })),
    photo: {
      permitted: photoPermission === "yes",
      text: photoConsentOptions[photoPermission],
      options: { yes: photoConsentOptions.yes, no: photoConsentOptions.no },
    },
  };
}

interface BookingForConsent {
  scheduledAt: Date;
  user: { name: string; email: string };
  dog: { name: string };
  service: { name: string };
}

export async function generateConsentPdf(
  record: Pick<
    ConsentRecord,
    "signedName" | "signedAt" | "termsVersion" | "snapshot"
  >,
  booking: BookingForConsent
): Promise<Uint8Array> {
  return buildConsentPdf({
    businessName: businessInfo.name,
    customerName: booking.user.name,
    customerEmail: booking.user.email,
    dogName: booking.dog.name,
    serviceName: booking.service.name,
    appointmentAt: booking.scheduledAt,
    signedName: record.signedName,
    signedAt: record.signedAt,
    termsVersion: record.termsVersion,
    snapshot: record.snapshot as unknown as ConsentSnapshot,
  });
}
