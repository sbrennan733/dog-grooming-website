import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

// Start times an admin can open, every half hour through the working day.
export const SLOT_TIME_OPTIONS: string[] = Array.from(
  { length: 21 },
  (_, index) => {
    const minutes = 7 * 60 + index * 30;
    const hours = Math.floor(minutes / 60)
      .toString()
      .padStart(2, "0");
    const mins = (minutes % 60).toString().padStart(2, "0");
    return `${hours}:${mins}`;
  }
);

export const addSlotsSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Please choose a date." }),
  times: z
    .array(z.string().regex(timePattern))
    .min(1, { error: "Choose at least one start time." })
    .max(SLOT_TIME_OPTIONS.length),
});

export type AddSlotsFormState =
  | {
      errors?: {
        date?: string[];
        times?: string[];
      };
      message?: string;
      // Sent back after an error so the form keeps what was entered.
      values?: { date: string; times: string[] };
    }
  | undefined;
