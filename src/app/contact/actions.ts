"use server";

import { prisma } from "@/lib/prisma";
import { businessInfo } from "@/data/business";
import { sendEmail } from "@/lib/email/mailer";
import { buildContactNotificationEmail } from "@/lib/email/contact-email";
import {
  contactSchema,
  type ContactFormState,
} from "@/lib/validations/contact";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_SENDER_PER_WINDOW = 3;
const MAX_TOTAL_PER_WINDOW = 30;

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function sendContactMessage(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  // Honeypot: real visitors never see or fill this field, bots usually do.
  // Pretend it worked so the bot learns nothing.
  if (text(formData, "website") !== "") {
    return { success: true };
  }

  const values = {
    name: text(formData, "name"),
    email: text(formData, "email"),
    subject: text(formData, "subject"),
    message: text(formData, "message"),
  };

  const validatedFields = contactSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      values,
    };
  }

  const { name, email, subject, message } = validatedFields.data;

  // This form is public, so cap how fast messages can be created. Counting
  // saved messages needs no extra infrastructure.
  const since = new Date(Date.now() - WINDOW_MS);
  const [fromSender, total] = await Promise.all([
    prisma.contactMessage.count({
      where: { email, createdAt: { gte: since } },
    }),
    prisma.contactMessage.count({ where: { createdAt: { gte: since } } }),
  ]);

  if (fromSender >= MAX_PER_SENDER_PER_WINDOW || total >= MAX_TOTAL_PER_WINDOW) {
    return {
      message: `We've received a lot of messages recently. Please try again later, or email ${businessInfo.contact.email} directly.`,
      values,
    };
  }

  // Save first so the message is never lost, even if the email fails.
  await prisma.contactMessage.create({
    data: { name, email, subject, message },
  });

  try {
    await sendEmail(
      buildContactNotificationEmail({ name, email, subject, message })
    );
  } catch (error) {
    // The message is safely stored and visible in the admin area, so the
    // visitor still gets a success message.
    console.error("Could not send contact notification email:", error);
  }

  return { success: true };
}
