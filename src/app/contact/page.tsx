import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { businessInfo } from "@/data/business";
import ContactInfo from "@/components/contact/ContactInfo";
import ContactForm from "@/components/contact/ContactForm";
import VerificationBanner from "@/components/account/VerificationBanner";
import ButtonLink from "@/components/ui/ButtonLink";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch to ask a question or book an appointment.",
};

export default async function ContactPage() {
  const session = await auth();

  const account = session?.user
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true, emailVerified: true },
      })
    : null;

  const dogs =
    account?.emailVerified && session?.user
      ? await prisma.dog.findMany({
          where: { ownerId: session.user.id },
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true, breed: true },
        })
      : [];

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
            {!account ? (
              <div>
                <h2 className="mb-4 text-3xl text-ink">Send a Message</h2>

                <p className="mb-6 text-muted">
                  To message us through the website, please log in or create
                  an account first, so we know which dog you&apos;re asking
                  about. If you&apos;d rather not, you&apos;re welcome to call
                  or text us on{" "}
                  <a
                    href={`tel:${businessInfo.contact.phone.replace(/\s/g, "")}`}
                    className="font-bold text-brand underline underline-offset-2"
                  >
                    {businessInfo.contact.phone}
                  </a>
                  .
                </p>

                <div className="flex flex-wrap gap-3">
                  <ButtonLink href="/login">Log In</ButtonLink>

                  <ButtonLink href="/register" variant="secondary">
                    Create an Account
                  </ButtonLink>
                </div>
              </div>
            ) : !account.emailVerified ? (
              <div>
                <h2 className="mb-4 text-3xl text-ink">Send a Message</h2>

                <VerificationBanner email={account.email} />
              </div>
            ) : dogs.length === 0 ? (
              <div>
                <h2 className="mb-4 text-3xl text-ink">Send a Message</h2>

                <p className="mb-6 text-muted">
                  Please add your dog to your account first, so we know who
                  you&apos;re asking about.
                </p>

                <ButtonLink href="/customer/dogs/new">Add a Dog</ButtonLink>
              </div>
            ) : (
              <ContactForm dogs={dogs} email={account.email} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
