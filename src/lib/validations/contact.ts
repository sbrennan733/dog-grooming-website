import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Please enter your name." })
    .max(100, { error: "Please keep your name under 100 characters." }),
  email: z
    .email({ error: "Please enter a valid email address." })
    .trim()
    .max(254, { error: "That email address is too long." }),
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
        name?: string[];
        email?: string[];
        subject?: string[];
        message?: string[];
      };
      // Sent back so a failed submit doesn't wipe what the person typed.
      values?: {
        name: string;
        email: string;
        subject: string;
        message: string;
      };
    }
  | undefined;
