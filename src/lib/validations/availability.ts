import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const overrideSchema = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Please choose a date." }),
    isClosed: z.boolean(),
    startTime: z
      .string()
      .regex(timePattern, { error: "Enter a valid opening time." })
      .or(z.literal("")),
    endTime: z
      .string()
      .regex(timePattern, { error: "Enter a valid closing time." })
      .or(z.literal("")),
  })
  .refine((data) => data.isClosed || (data.startTime && data.endTime), {
    error: "Enter opening and closing times, or mark the day as closed.",
    path: ["startTime"],
  })
  .refine(
    (data) =>
      data.isClosed ||
      !data.startTime ||
      !data.endTime ||
      data.startTime < data.endTime,
    {
      error: "Closing time must be after opening time.",
      path: ["endTime"],
    }
  );

export type OverrideFormState =
  | {
      errors?: {
        date?: string[];
        startTime?: string[];
        endTime?: string[];
      };
      message?: string;
    }
  | undefined;
