"use server";

import { requireUser } from "@/lib/auth-guards";
import { requestVerificationEmail } from "@/lib/email-verification";

export interface ResendState {
  ok?: boolean;
  message?: string;
}

export async function resendVerificationEmail(): Promise<ResendState> {
  const user = await requireUser();
  const result = await requestVerificationEmail(user.id);

  switch (result.status) {
    case "sent":
      return {
        ok: true,
        message: "We've sent you a new confirmation email.",
      };
    case "already-verified":
      return { ok: true, message: "Your email is already confirmed." };
    case "too-soon":
      return {
        message: `Please wait ${result.retryAfterSeconds} seconds before requesting another email.`,
      };
    case "failed":
      return {
        message:
          "We couldn't send the email just now. Please try again in a few minutes.",
      };
  }
}
