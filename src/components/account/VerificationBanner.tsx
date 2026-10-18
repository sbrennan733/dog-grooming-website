import ResendVerificationForm from "./ResendVerificationForm";

export default function VerificationBanner({ email }: { email: string }) {
  return (
    <div className="rounded-2xl border-2 border-line bg-surface-alt p-5">
      <h2 className="mb-1 text-lg text-ink">Please confirm your email</h2>

      <p className="mb-4 text-muted">
        We sent a confirmation link to{" "}
        <span className="[overflow-wrap:anywhere]">{email}</span>. You&apos;ll
        need to confirm it before you can book an appointment.
      </p>

      <ResendVerificationForm />
    </div>
  );
}
