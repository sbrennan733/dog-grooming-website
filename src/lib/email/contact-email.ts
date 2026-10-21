import { businessInfo } from "@/data/business";
import type { EmailMessage } from "./mailer";
import { escapeHtml } from "./escape-html";

// Notifies the business that someone used the contact form. Replying to the
// email goes straight to the person who wrote in.
export function buildContactNotificationEmail(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): EmailMessage {
  const { name, email, subject, message } = input;

  // Header values must be a single line (stops header injection).
  const singleLine = (value: string) => value.replace(/\s+/g, " ").trim();

  const text = [
    `New message from the website contact form.`,
    "",
    `Name: ${singleLine(name)}`,
    `Email: ${email}`,
    `Subject: ${singleLine(subject)}`,
    "",
    message,
    "",
    `Hit reply to answer ${singleLine(name)} directly.`,
  ].join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#fbf7f2;font-family:Arial,Helvetica,sans-serif;color:#2b2622;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
      <h1 style="margin:0 0 16px;font-size:20px;">New website message</h1>
      <p style="margin:0 0 4px;"><strong>Name:</strong> ${escapeHtml(singleLine(name))}</p>
      <p style="margin:0 0 4px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p style="margin:0 0 16px;"><strong>Subject:</strong> ${escapeHtml(singleLine(subject))}</p>
      <p style="margin:0 0 16px;line-height:1.5;white-space:pre-wrap;">${escapeHtml(message)}</p>
      <p style="margin:0;font-size:14px;color:#6b625b;">Hit reply to answer ${escapeHtml(singleLine(name))} directly.</p>
    </div>
  </body>
</html>`;

  return {
    to: businessInfo.contact.email,
    replyTo: email,
    subject: `Website message from ${singleLine(name)}: ${singleLine(subject)}`.slice(0, 200),
    text,
    html,
  };
}
