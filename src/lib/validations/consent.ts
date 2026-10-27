import { z } from "zod";
import {
  CONSENT_VERSION,
  photoConsentOptions,
  requiredStatementIds,
} from "@/data/consent";

// What the booking form sends with the booking. Everything is re-checked on
// the server, so the consent step can't be skipped.
export const consentSchema = z
  .object({
    termsVersion: z.literal(CONSENT_VERSION, {
      error:
        "The terms have just been updated. Please read them again and tick the boxes.",
    }),
    agreedStatementIds: z.array(z.string().max(60)).max(50),
    photoPermission: z.enum(Object.keys(photoConsentOptions) as ["yes", "no"], {
      error: "Please choose one of the photo options.",
    }),
    signedName: z
      .string()
      .trim()
      .min(2, { error: "Please type your full name as your signature." })
      .max(100, { error: "That name is too long." }),
  })
  .refine(
    (data) =>
      requiredStatementIds.every((id) => data.agreedStatementIds.includes(id)),
    { error: "Please tick every box to confirm you agree.", path: ["agreedStatementIds"] }
  );

export type ConsentInput = z.infer<typeof consentSchema>;
