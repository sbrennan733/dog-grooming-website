"use client";

import { useState, useTransition } from "react";
import {
  resendVerificationEmail,
  type ResendState,
} from "@/app/customer/verification-actions";
import Button from "@/components/ui/Button";

export default function ResendVerificationForm() {
  const [state, setState] = useState<ResendState>({});
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      setState(await resendVerificationEmail());
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button
        type="button"
        variant="secondary"
        onClick={handleClick}
        disabled={pending}
      >
        {pending ? "Sending..." : "Resend confirmation email"}
      </Button>

      <p
        role="status"
        className={state.ok ? "text-sm text-ink" : "text-sm text-danger"}
      >
        {state.message}
      </p>
    </div>
  );
}
