import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Appointment",
  description: "Booking is coming soon.",
};

export default function BookingPage() {
  return (
    <div className="bg-white px-6 py-20 text-center">
      <h1 className="mb-4 text-4xl font-bold text-gray-900">
        Booking Coming Soon
      </h1>

      <p className="text-lg text-gray-600">
        Online booking is under construction. Please contact us directly to
        arrange an appointment in the meantime.
      </p>
    </div>
  );
}
