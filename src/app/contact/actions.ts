"use server";

import { requireUser } from "@/lib/auth-guards";
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
  // Only signed-in customers can write to us. Server Actions are plain POST
  // endpoints, so this is checked here, not just by the page hiding the form.
  const user = await requireUser();

  const values = {
    dogId: text(formData, "dogId"),
    subject: text(formData, "subject"),
    message: text(formData, "message"),
  };

  const account = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, emailVerified: true },
  });

  if (!account?.emailVerified) {
    return {
      message: "Please confirm your email address before sending a message.",
      values,
    };
  }

  const validatedFields = contactSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      values,
    };
  }

  const { dogId, subject, message } = validatedFields.data;

  // The dog must be one of this customer's own.
  const dog = await prisma.dog.findFirst({
    where: { id: dogId, ownerId: user.id },
    select: { name: true, breed: true },
  });

  if (!dog) {
    return {
      errors: { dogId: ["Please choose which dog your message is about."] },
      values,
    };
  }

  // Cap how fast messages can be created. Counting saved messages needs no
  // extra infrastructure.
  const since = new Date(Date.now() - WINDOW_MS);
  const [fromSender, total] = await Promise.all([
    prisma.contactMessage.count({
      where: { email: account.email, createdAt: { gte: since } },
    }),
    prisma.contactMessage.count({ where: { createdAt: { gte: since } } }),
  ]);

  if (fromSender >= MAX_PER_SENDER_PER_WINDOW || total >= MAX_TOTAL_PER_WINDOW) {
    return {
      message: `We've received a lot of messages recently. Please try again later, or call us on ${businessInfo.contact.phone}.`,
      values,
    };
  }

  // Save first so the message is never lost, even if the email fails.
  await prisma.contactMessage.create({
    data: {
      name: account.name,
      email: account.email,
      subject,
      message,
      dogName: dog.name,
      dogBreed: dog.breed,
    },
  });

  try {
    await sendEmail(
      buildContactNotificationEmail({
        name: account.name,
        email: account.email,
        dogName: dog.name,
        dogBreed: dog.breed,
        subject,
        message,
      })
    );
  } catch (error) {
    // The message is safely stored and visible in the admin area, so the
    // visitor still gets a success message.
    console.error("Could not send contact notification email:", error);
  }

  return { success: true };
}
