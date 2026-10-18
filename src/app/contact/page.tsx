import type { Metadata } from "next";
import ContactInfo from "@/components/contact/ContactInfo";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch to ask a question or book an appointment.",
};

export default function ContactPage() {
  return (
    <div className="bg-background px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-5xl text-ink">
            Get In Touch
          </h1>

          <p className="text-lg text-muted">
            We&apos;d love to hear from you
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          <ContactInfo />
          <div className="rounded-3xl bg-surface p-8 shadow-soft">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
