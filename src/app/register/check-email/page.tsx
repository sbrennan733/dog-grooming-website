import type { Metadata } from "next";
import ButtonLink from "@/components/ui/ButtonLink";

export const metadata: Metadata = {
  title: "Check Your Email",
  robots: { index: false, follow: false },
};

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;
  const emailFailed = sent === "false";

  return (
    <div className="bg-background px-6 py-20 text-center">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-4 text-4xl text-ink">
          {emailFailed ? "Account created" : "Check your email"}
        </h1>

        {emailFailed ? (
          <p className="mb-8 text-lg text-muted">
            Your account is ready, but we couldn&apos;t send your confirmation
            email just now. Log in and you can request it again from your
            account page.
          </p>
        ) : (
          <p className="mb-8 text-lg text-muted">
            We&apos;ve sent you a link to confirm your email address. It can
            take a minute to arrive, so check your spam folder if you don&apos;t
            see it. You can log in now, and you&apos;ll need to confirm before
            you can book.
          </p>
        )}

        <ButtonLink href="/login">Log in</ButtonLink>
      </div>
    </div>
  );
}
