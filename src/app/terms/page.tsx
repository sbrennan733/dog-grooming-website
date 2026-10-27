import type { Metadata } from "next";
import {
  consentSections,
  photoConsentOptions,
  termsPoints,
} from "@/data/consent";
import { businessInfo } from "@/data/business";

export const metadata: Metadata = {
  title: "Terms & Consent",
  description: `The terms and consent for grooming appointments with ${businessInfo.name}.`,
};

export default function TermsPage() {
  return (
    <div className="bg-background px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 text-4xl text-ink">Terms &amp; Consent</h1>

        <p className="mb-10 text-lg text-muted">
          When you book with {businessInfo.name} you read these terms and tick
          to say you agree. A signed copy is kept for each visit.
        </p>

        <section className="mb-10 rounded-3xl bg-surface p-8 shadow-soft">
          <h2 className="mb-4 text-2xl text-ink">Terms and conditions</h2>

          <dl className="space-y-4">
            {termsPoints.map((point) => (
              <div key={point.heading}>
                <dt className="font-semibold text-ink">{point.heading}</dt>
                <dd className="text-muted">{point.text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-3xl bg-surface p-8 shadow-soft">
          <h2 className="mb-2 text-2xl text-ink">Consent form</h2>
          <p className="mb-6 text-muted">
            You will be asked to agree to the following when you book.
          </p>

          <div className="space-y-6">
            {consentSections.map((section) => (
              <div key={section.heading}>
                <h3 className="mb-2 text-lg text-ink">{section.heading}</h3>

                <ul className="list-disc space-y-2 pl-5 text-muted">
                  {section.statements.map((statement) => (
                    <li key={statement.id}>{statement.text}</li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h3 className="mb-2 text-lg text-ink">
                Photography and social media
              </h3>
              <p className="mb-2 text-muted">You choose one of these:</p>

              <ul className="list-disc space-y-2 pl-5 text-muted">
                <li>{photoConsentOptions.yes}</li>
                <li>{photoConsentOptions.no}</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
