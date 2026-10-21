import type { Metadata } from "next";
import ButtonLink from "@/components/ui/ButtonLink";

export const metadata: Metadata = {
  title: "Confirm Your Email",
  robots: { index: false, follow: false },
};

const MESSAGES = {
  verified: {
    title: "Email confirmed",
    body: "Thanks, your email address is confirmed. You can now book appointments.",
    cta: { href: "/booking", label: "Book an appointment" },
  },
  expired: {
    title: "This link has expired",
    body: "Confirmation links only last 24 hours. Log in and we'll send you a fresh one.",
    cta: { href: "/customer", label: "Log in" },
  },
  invalid: {
    title: "This link isn't valid",
    body: "It may have already been used, or replaced by a newer email. If you've already confirmed your address you're all set; otherwise log in and request a new link.",
    cta: { href: "/customer", label: "Go to my account" },
  },
} as const;

type Status = keyof typeof MESSAGES;

function isStatus(value: string | undefined): value is Status {
  return value === "verified" || value === "expired" || value === "invalid";
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const message = MESSAGES[isStatus(status) ? status : "invalid"];

  return (
    <div className="bg-background px-6 py-20 text-center">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-4 text-4xl text-ink">{message.title}</h1>

        <p className="mb-8 text-lg text-muted">{message.body}</p>

        <ButtonLink href={message.cta.href}>{message.cta.label}</ButtonLink>
      </div>
    </div>
  );
}
