import { businessInfo } from "@/data/business";
import type { EmailMessage } from "./mailer";
import { escapeHtml } from "./escape-html";

export function buildVerificationEmail(input: {
  to: string;
  name: string;
  verifyUrl: string;
  validForHours: number;
}): EmailMessage {
  const { to, name, verifyUrl, validForHours } = input;
  const business = businessInfo.name;
  const firstName = name.trim().split(/\s+/)[0] || "there";

  const text = [
    `Hi ${firstName},`,
    "",
    `Thanks for creating an account with ${business}. Please confirm your email address by opening this link:`,
    "",
    verifyUrl,
    "",
    `The link is valid for ${validForHours} hours. If you didn't create an account, you can ignore this email.`,
    "",
    `${business}`,
  ].join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#fbf7f2;font-family:Arial,Helvetica,sans-serif;color:#2b2622;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
      <h1 style="margin:0 0 16px;font-size:22px;">Confirm your email</h1>
      <p style="margin:0 0 16px;line-height:1.5;">Hi ${escapeHtml(firstName)},</p>
      <p style="margin:0 0 24px;line-height:1.5;">
        Thanks for creating an account with ${escapeHtml(business)}. Please confirm your email address so we can reach you about your appointments.
      </p>
      <p style="margin:0 0 24px;">
        <a href="${escapeHtml(verifyUrl)}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 28px;border-radius:999px;">Confirm my email</a>
      </p>
      <p style="margin:0 0 8px;font-size:14px;color:#6b625b;line-height:1.5;">
        Or copy this link into your browser:<br />
        <span style="word-break:break-all;">${escapeHtml(verifyUrl)}</span>
      </p>
      <p style="margin:16px 0 0;font-size:14px;color:#6b625b;line-height:1.5;">
        The link is valid for ${validForHours} hours. If you didn't create an account, you can ignore this email.
      </p>
    </div>
  </body>
</html>`;

  return {
    to,
    subject: `Confirm your email for ${business}`,
    text,
    html,
  };
}
