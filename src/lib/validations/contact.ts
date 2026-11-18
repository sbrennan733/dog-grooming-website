import { z } from "zod";

// The sender's name and email come from their account, so the form only asks
// which dog the message is about, plus the subject and message.
export const contactSchema = z.object({
  dogId: z
    .string()
    .trim()
    .min(1, { error: "Please choose which dog your message is about." }),
  subject: z
    .string()
    .trim()
    .min(1, { error: "Please enter a subject." })
    .max(150, { error: "Please keep the subject under 150 characters." }),
  message: z
    .string()
    .trim()
    .min(10, {
      error: "Please provide a little more detail (at least 10 characters).",
    })
    .max(2000, { error: "Please keep your message under 2000 characters." }),
});

export type ContactFormState =
  | {
      success?: boolean;
      message?: string;
      errors?: {
        dogId?: string[];
        subject?: string[];
        message?: string[];
      };
      // Sent back so a failed submit doesn't wipe what the person typed.
      values?: {
        dogId: string;
        subject: string;
        message: string;
      };
    }
  | undefined;
