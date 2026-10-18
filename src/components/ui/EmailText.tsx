// Renders an email address with a preferred line-break point just before
// the "@", so a long address wraps as "name" / "@domain.com" in narrow
// spaces instead of splitting in the middle of a word.
export default function EmailText({ email }: { email: string }) {
  const at = email.indexOf("@");

  if (at === -1) {
    return <>{email}</>;
  }

  return (
    <>
      {email.slice(0, at)}
      <wbr />
      {email.slice(at)}
    </>
  );
}
