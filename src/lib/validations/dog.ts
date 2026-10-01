import { z } from "zod";

export const dogSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Please enter your dog's name." }),
  breed: z
    .string()
    .trim()
    .min(1, { error: "Please enter your dog's breed." }),
  age: z.coerce
    .number({ error: "Please enter your dog's age." })
    .int({ error: "Age must be a whole number." })
    .min(0, { error: "Age can't be negative." })
    .max(30, { error: "Please enter a realistic age." }),
  notes: z.string().trim().optional(),
});

export type DogFormState =
  | {
      errors?: {
        name?: string[];
        breed?: string[];
        age?: string[];
        notes?: string[];
      };
      message?: string;
    }
  | undefined;
