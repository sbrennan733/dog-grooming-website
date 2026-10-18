import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import { businessInfo } from "@/data/business";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
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
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
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

  console.log(`[email] SMTP not configured, wrote "${message.subject}" to ${file}`);
}

export async function sendEmail(message: EmailMessage): Promise<void> {
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
    "Email is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS (see .env.example)."
  );
}
