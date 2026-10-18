import type { Metadata } from "next";
import ButtonLink from "@/components/ui/ButtonLink";
import { businessInfo } from "@/data/business";

export const metadata: Metadata = {
  title: "Booking Received",
  robots: { index: false, follow: false },
};

export default function BookingConfirmationPage() {
  return (
    <div className="bg-white px-6 py-20 text-center">
      <h1 className="mb-4 text-4xl font-bold text-gray-900">
        Booking Request Received
      </h1>

      <p className="mx-auto mb-8 max-w-md text-lg text-gray-600">
        Thanks! Your appointment request has been received and is pending
        confirmation. We&apos;ll be in touch to confirm
        {businessInfo.payment.depositsEnabled
          ? " and arrange your deposit."
          : ". Payment is taken in cash at your appointment."}
      </p>

      <ButtonLink href="/customer">View My Account</ButtonLink>
    </div>
  );
}
