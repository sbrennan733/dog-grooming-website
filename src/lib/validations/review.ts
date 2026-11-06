import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.coerce
    .number({ error: "Please choose a star rating." })
    .int({ error: "Please choose a star rating." })
    .min(1, { error: "Please choose a star rating." })
    .max(5, { error: "Please choose a star rating." }),
  comment: z
    .string()
    .trim()
    .min(10, {
      error: "Please write a little more (at least 10 characters).",
    })
    .max(1000, { error: "Please keep your review under 1000 characters." }),
});

export type ReviewFormState =
  | {
      success?: boolean;
      message?: string;
      errors?: {
        rating?: string[];
        comment?: string[];
      };
      // Sent back so a failed submit doesn't wipe what the person typed.
      values?: {
        rating: string;
        comment: string;
      };
    }
  | undefined;
