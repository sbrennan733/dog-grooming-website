import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import { businessInfo } from "@/data/business";
import { sendViaGraph } from "./microsoft-graph";

export interface EmailAttachment {
  filename: string;
  contentType: string;
  content: Uint8Array;
}

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
  // Where replies should go. Defaults to the business email.
  replyTo?: string;
  attachments?: EmailAttachment[];
}

function graphIsConfigured(): boolean {
  return Boolean(process.env.MS_CLIENT_ID && process.env.MS_REFRESH_TOKEN);
}

function smtpIsConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );
}

async function sendViaSmtp(message: EmailMessage): Promise<void> {
  const port = Number(process.env.SMTP_PORT ?? 465);
  const secure = port === 465;

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    // On the STARTTLS ports (e.g. 587) refuse to continue unencrypted, so
    // credentials and message content are never sent in the clear.
    requireTLS: !secure && process.env.SMTP_REQUIRE_TLS !== "false",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transport.sendMail({
    from:
      process.env.EMAIL_FROM ??
      `"${businessInfo.name}" <${process.env.SMTP_USER}>`,
    // Replies go to the business inbox even if the sending account differs.
    replyTo: message.replyTo ?? businessInfo.contact.email,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
    attachments: message.attachments?.map((attachment) => ({
      filename: attachment.filename,
      contentType: attachment.contentType,
      content: Buffer.from(attachment.content),
    })),
  });
}

// Development convenience: with no SMTP settings, "send" by writing the
// email to .dev-mail/ so the whole flow can be tried without real
// credentials or emailing anyone.
async function writeToDevOutbox(message: EmailMessage): Promise<void> {
  const directory = path.join(process.cwd(), ".dev-mail");
  await mkdir(directory, { recursive: true });

  const safeRecipient = message.to.replace(/[^a-zA-Z0-9@._-]/g, "_");
  const file = path.join(directory, `${Date.now()}-${safeRecipient}.txt`);

  await writeFile(
    file,
    `To: ${message.to}\nSubject: ${message.subject}\n\n${message.text}\n`,
    "utf8"
  );

  // Attachments are saved next to the email so they can be opened.
  for (const attachment of message.attachments ?? []) {
    const safeName = attachment.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    await writeFile(`${file}.${safeName}`, attachment.content);
  }

  console.log(`[email] SMTP not configured, wrote "${message.subject}" to ${file}`);
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  // EMAIL_MODE=outbox forces the local outbox folder even when real email is
  // configured, so development and tests can never email real people.
  if (
    process.env.EMAIL_MODE === "outbox" &&
    process.env.NODE_ENV !== "production"
  ) {
    await writeToDevOutbox(message);
    return;
  }

  if (graphIsConfigured()) {
    await sendViaGraph(
      {
        clientId: process.env.MS_CLIENT_ID!,
        refreshToken: process.env.MS_REFRESH_TOKEN!,
      },
      message
    );
    return;
  }

  if (smtpIsConfigured()) {
    await sendViaSmtp(message);
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    await writeToDevOutbox(message);
    return;
  }

  // Fail loudly: silently dropping verification emails would leave
  // customers stuck with no way to know why.
  throw new Error(
    "Email is not configured. Set MS_CLIENT_ID and MS_REFRESH_TOKEN, or SMTP_HOST, SMTP_USER and SMTP_PASS (see .env.example)."
  );
}
