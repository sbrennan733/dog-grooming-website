import { businessInfo } from "@/data/business";
import { BUSINESS_TIME_ZONE } from "@/lib/timezone";
import type { EmailMessage } from "./mailer";
import { escapeHtml } from "./escape-html";

interface BookingEmailInput {
  status: "CONFIRMED" | "CANCELLED";
  to: string;
  customerName: string;
  dogName: string;
  serviceName: string;
  scheduledAt: Date;
  // Already formatted, e.g. "£40.00" or "from £50.00".
  priceText: string;
  // Link to the booking page, if the site address is known.
  rebookUrl?: string;
}

function formatAppointment(scheduledAt: Date): string {
  const date = scheduledAt.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: BUSINESS_TIME_ZONE,
  });
  const time = scheduledAt.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: BUSINESS_TIME_ZONE,
  });

  return `${date} at ${time}`;
}

// The email a customer gets when the business confirms or cancels their
// booking, with the booking details repeated so it can be kept for reference.
export function buildBookingStatusEmail(input: BookingEmailInput): EmailMessage {
  const {
    status,
    to,
    customerName,
    dogName,
    serviceName,
    scheduledAt,
    priceText,
    rebookUrl,
  } = input;

  const business = businessInfo.name;
  const firstName = customerName.trim().split(/\s+/)[0] || "there";
  const when = formatAppointment(scheduledAt);
  const confirmed = status === "CONFIRMED";

  const subject = confirmed
    ? `Your ${business} booking is confirmed`
    : `Your ${business} booking has been cancelled`;

  const intro = confirmed
    ? `Good news, your booking with ${business} is confirmed. Here are the details:`
    : `We're sorry, but your booking with ${business} has been cancelled. These were the details:`;

  const details: [string, string][] = [
    ["Dog", dogName],
    ["Service", serviceName],
    ["When", when],
    ["Price", confirmed ? `${priceText}, payable in cash at your appointment` : priceText],
  ];
  if (confirmed) {
    details.push(["Where", businessInfo.contact.address]);
  }

  const outro = confirmed
    ? `If you need to change or cancel, please call or text us on ${businessInfo.contact.phone}, or reply to this email.`
    : `If you'd like to book another time${rebookUrl ? `, you can do that at ${rebookUrl}` : " on our website"}, or call or text us on ${businessInfo.contact.phone}.`;

  const text = [
    `Hi ${firstName},`,
    "",
    intro,
    "",
    ...details.map(([label, value]) => `${label}: ${value}`),
    "",
    outro,
    "",
    business,
  ].join("\n");

  const accent = confirmed ? "#0b5c55" : "#8a1c12";

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#fbf7f2;font-family:Arial,Helvetica,sans-serif;color:#2b2622;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
      <h1 style="margin:0 0 16px;font-size:22px;color:${accent};">${confirmed ? "Booking confirmed" : "Booking cancelled"}</h1>
      <p style="margin:0 0 16px;line-height:1.5;">Hi ${escapeHtml(firstName)},</p>
      <p style="margin:0 0 20px;line-height:1.5;">${escapeHtml(intro)}</p>
      <table style="border-collapse:collapse;margin:0 0 20px;width:100%;">
        ${details
          .map(
            ([label, value]) =>
              `<tr><td style="padding:6px 12px 6px 0;color:#6b625b;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td><td style="padding:6px 0;font-weight:bold;">${escapeHtml(value)}</td></tr>`
          )
          .join("\n        ")}
      </table>
      <p style="margin:0;line-height:1.5;">${escapeHtml(outro)}</p>
    </div>
  </body>
</html>`;

  return { to, subject, text, html };
}
