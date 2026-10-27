import { businessInfo } from "@/data/business";
import { BUSINESS_TIME_ZONE } from "@/lib/timezone";
import type { EmailMessage } from "./mailer";
import { escapeHtml } from "./escape-html";

interface ConsentEmailInput {
  customerName: string;
  customerEmail: string;
  dogName: string;
  serviceName: string;
  appointmentAt: Date;
  photoPermission: boolean;
  pdf: Uint8Array;
}

// Sent to the business whenever a customer signs the consent form while
// booking, with the signed form attached as a PDF for the business's records.
export function buildConsentEmail(input: ConsentEmailInput): EmailMessage {
  const {
    customerName,
    customerEmail,
    dogName,
    serviceName,
    appointmentAt,
    photoPermission,
    pdf,
  } = input;

  const when = `${appointmentAt.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: BUSINESS_TIME_ZONE,
  })} at ${appointmentAt.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: BUSINESS_TIME_ZONE,
  })}`;

  const singleLine = (value: string) => value.replace(/\s+/g, " ").trim();
  const safeDog = singleLine(dogName);

  const lines = [
    `${singleLine(customerName)} has booked and signed the consent form.`,
    "",
    `Dog: ${safeDog}`,
    `Owner: ${singleLine(customerName)} (${customerEmail})`,
    `Service: ${serviceName}`,
    `Appointment: ${when}`,
    `Photos for marketing: ${photoPermission ? "Yes, permission given" : "No, permission NOT given"}`,
    "",
    "The signed form is attached as a PDF so you have a record of this visit. You can also download it from the booking in the Admin area.",
  ];

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#fbf7f2;font-family:Arial,Helvetica,sans-serif;color:#2b2622;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
      <h1 style="margin:0 0 16px;font-size:20px;color:#0f766e;">Signed consent form</h1>
      <p style="margin:0 0 16px;line-height:1.5;">${escapeHtml(singleLine(customerName))} has booked and signed the consent form.</p>
      <table style="border-collapse:collapse;margin:0 0 20px;width:100%;">
        <tr><td style="padding:6px 12px 6px 0;color:#6b625b;">Dog</td><td style="padding:6px 0;font-weight:bold;">${escapeHtml(safeDog)}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#6b625b;">Owner</td><td style="padding:6px 0;font-weight:bold;">${escapeHtml(singleLine(customerName))} (${escapeHtml(customerEmail)})</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#6b625b;">Service</td><td style="padding:6px 0;font-weight:bold;">${escapeHtml(serviceName)}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#6b625b;">Appointment</td><td style="padding:6px 0;font-weight:bold;">${escapeHtml(when)}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#6b625b;">Photos</td><td style="padding:6px 0;font-weight:bold;">${photoPermission ? "Permission given" : "Permission NOT given"}</td></tr>
      </table>
      <p style="margin:0;line-height:1.5;">The signed form is attached as a PDF so you have a record of this visit. You can also download it from the booking in the Admin area.</p>
    </div>
  </body>
</html>`;

  const fileDate = appointmentAt.toLocaleDateString("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
  });
  const fileSafeDog = safeDog.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "") || "dog";

  return {
    to: businessInfo.contact.email,
    replyTo: customerEmail,
    subject: `Signed consent: ${safeDog} (${singleLine(customerName)}) - ${fileDate}`.slice(0, 200),
    text: lines.join("\n"),
    html,
    attachments: [
      {
        filename: `consent-${fileSafeDog}-${fileDate}.pdf`,
        contentType: "application/pdf",
        content: pdf,
      },
    ],
  };
}
