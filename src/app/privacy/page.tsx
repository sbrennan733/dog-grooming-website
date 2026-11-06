import type { Metadata } from "next";
import { businessInfo } from "@/data/business";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description: `How ${businessInfo.name} collects, uses and protects your personal information.`,
};

// Update this whenever the notice changes.
const LAST_UPDATED = "6 November 2026";

const sectionClassName = "mb-6 rounded-3xl bg-surface p-8 shadow-soft";
const listClassName = "list-disc space-y-2 pl-5 text-muted";
const linkClassName = "font-bold text-brand hover:underline";

export default function PrivacyPage() {
  const email = businessInfo.contact.email;

  return (
    <div className="bg-background px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 text-4xl text-ink">Privacy Notice</h1>

        <p className="mb-10 text-lg text-muted">
          This explains what personal information {businessInfo.name} collects
          through this website, why, and what your rights are. Last updated{" "}
          {LAST_UPDATED}.
        </p>

        <section className={sectionClassName}>
          <h2 className="mb-4 text-2xl text-ink">Who we are</h2>
          <p className="text-muted">
            {businessInfo.name} is a dog grooming business in{" "}
            {businessInfo.contact.address}. We are responsible for your
            personal information. For anything in this notice, or to use any
            of your rights, contact us at{" "}
            <a href={`mailto:${email}`} className={linkClassName}>
              {email}
            </a>{" "}
            or on {businessInfo.contact.phone}.
          </p>
        </section>

        <section className={sectionClassName}>
          <h2 className="mb-4 text-2xl text-ink">What we collect</h2>

          <ul className={listClassName}>
            <li>
              <strong className="text-ink">Your account:</strong> your name,
              email address and a password (stored scrambled, so we cannot
              read it).
            </li>
            <li>
              <strong className="text-ink">Your dogs:</strong> name, breed,
              age, coat type and any notes you add. Please keep notes to
              things about your dog&apos;s care.
            </li>
            <li>
              <strong className="text-ink">Your bookings:</strong> which dog,
              which service, the date and time, the price and its status.
            </li>
            <li>
              <strong className="text-ink">Your signed consent form:</strong>{" "}
              the terms version you agreed to, the statements you ticked,
              your photo choice, your typed signature, and the date and time
              you signed.
            </li>
            <li>
              <strong className="text-ink">Messages you send us:</strong> your
              name, email and what you write in the contact form.
            </li>
            <li>
              <strong className="text-ink">Reviews you write:</strong> your
              star rating and your comment, linked to your booking. If we
              approve it, it is shown on the website with your first name,
              the first letter of your surname and your dog&apos;s name.
            </li>
          </ul>

          <p className="mt-4 text-muted">
            We do not take card details on this website. Payment is in cash at
            your appointment.
          </p>
        </section>

        <section className={sectionClassName}>
          <h2 className="mb-4 text-2xl text-ink">
            Why we use it, and our legal reason
          </h2>

          <ul className={listClassName}>
            <li>
              <strong className="text-ink">
                To show your review on our website
              </strong>{" "}
              if you choose to write one. Our legal reason is your consent.
              You can ask us to take your review down at any time by
              contacting us.
            </li>
            <li>
              <strong className="text-ink">To run your bookings</strong>{" "}
              (creating your account, taking and confirming appointments,
              emailing you about them). Our legal reason is that we need it
              to provide the service you asked for.
            </li>
            <li>
              <strong className="text-ink">
                To keep a signed record of each visit
              </strong>{" "}
              and reply to your messages. Our legal reason is our legitimate
              interest in running the business and being able to show what
              was agreed.
            </li>
            <li>
              <strong className="text-ink">To keep business accounts</strong>.
              Our legal reason is that the law requires us to keep financial
              records.
            </li>
            <li>
              <strong className="text-ink">
                To share before and after photos of your dog
              </strong>{" "}
              on social media, only if you choose &quot;yes&quot; on your
              consent form. Our legal reason is your consent, and you can
              change your mind at any time by contacting us.
            </li>
          </ul>

          <p className="mt-4 text-muted">
            We do not sell your information, and we do not use it for
            advertising.
          </p>
        </section>

        <section className={sectionClassName}>
          <h2 className="mb-4 text-2xl text-ink">Who else handles it</h2>
          <p className="mb-3 text-muted">
            We use a few services to run this website. They handle your
            information only on our behalf:
          </p>

          <ul className={listClassName}>
            <li>Vercel, which hosts the website.</li>
            <li>Neon, which stores the database (in London).</li>
            <li>
              Microsoft, which provides the email we use to send you booking
              emails and to receive signed consent forms.
            </li>
          </ul>

          <p className="mt-4 text-muted">
            Some of these providers may process information outside the UK.
            Where they do, they use safeguards approved under UK data
            protection law. We do not share your information with anyone else
            unless the law requires it.
          </p>
        </section>

        <section className={sectionClassName}>
          <h2 className="mb-4 text-2xl text-ink">How long we keep it</h2>
          <p className="text-muted">
            We keep your account, your dogs&apos; details, your bookings and
            your signed consent forms, and any review you wrote, for 2 years
            after your last visit, then delete them. Financial records of payments we have received may
            be kept for longer, as the law requires. Messages you send through
            the contact form are kept for as long as needed to deal with them.
            You can ask us to delete your information sooner, see below.
          </p>
        </section>

        <section className={sectionClassName}>
          <h2 className="mb-4 text-2xl text-ink">Cookies</h2>
          <p className="text-muted">
            We use a single cookie, to keep you signed in. The website cannot
            work without it, so there is nothing to accept. We do not use
            tracking, analytics or advertising cookies.
          </p>
        </section>

        <section className={sectionClassName}>
          <h2 className="mb-4 text-2xl text-ink">Your rights</h2>
          <p className="mb-3 text-muted">
            Under UK data protection law you can ask us to:
          </p>

          <ul className={listClassName}>
            <li>give you a copy of the information we hold about you,</li>
            <li>correct anything that is wrong,</li>
            <li>delete your information,</li>
            <li>stop or limit how we use it,</li>
            <li>give you your information in a portable format, and</li>
            <li>stop using it where we rely on our legitimate interest.</li>
          </ul>

          <p className="mt-4 text-muted">
            Email us at{" "}
            <a href={`mailto:${email}`} className={linkClassName}>
              {email}
            </a>{" "}
            and we will reply within one month. If you are unhappy with how
            we have handled your information you can complain to the
            Information Commissioner&apos;s Office at{" "}
            <a
              href="https://ico.org.uk/make-a-complaint/"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
            >
              ico.org.uk
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            , though we would always like the chance to put things right
            first.
          </p>
        </section>

        <section className={sectionClassName}>
          <h2 className="mb-4 text-2xl text-ink">Changes</h2>
          <p className="text-muted">
            If we change how we use your information we will update this page
            and the date at the top.
          </p>
        </section>
      </div>
    </div>
  );
}
