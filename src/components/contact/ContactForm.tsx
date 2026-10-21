"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import {
  inputClassName,
  labelClassName,
} from "@/components/ui/form-styles";
import { sendContactMessage } from "@/app/contact/actions";

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendContactMessage,
    undefined
  );

  if (state?.success) {
    return (
      <div>
        <h2 className="mb-6 text-3xl text-ink">Send a Message</h2>

        <div role="status" className="rounded-2xl bg-ok-soft p-6 text-ok-ink">
          Thanks for reaching out — we&apos;ll get back to you as soon as
          possible.
        </div>
      </div>
    );
  }

  const messageErrors = state?.errors?.message;

  return (
    <div>
      <h2 className="mb-6 text-3xl text-ink">Send a Message</h2>

      <form action={formAction} className="space-y-5">
        <FormField
          label="Name"
          name="name"
          type="text"
          required
          maxLength={100}
          autoComplete="name"
          defaultValue={state?.values?.name}
          errors={state?.errors?.name}
        />

        <FormField
          label="Email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          defaultValue={state?.values?.email}
          errors={state?.errors?.email}
        />

        <FormField
          label="Subject"
          name="subject"
          type="text"
          required
          maxLength={150}
          defaultValue={state?.values?.subject}
          errors={state?.errors?.subject}
        />

        <div>
          <label htmlFor="message" className={labelClassName}>
            Message
          </label>

          <textarea
            id="message"
            name="message"
            rows={5}
            required
            maxLength={2000}
            defaultValue={state?.values?.message}
            aria-invalid={Boolean(messageErrors?.length)}
            aria-describedby={messageErrors?.length ? "message-error" : undefined}
            className={inputClassName}
          />

          {messageErrors?.length ? (
            <div id="message-error" role="alert">
              {messageErrors.map((error) => (
                <p key={error} className="mt-1 text-sm text-danger">
                  {error}
                </p>
              ))}
            </div>
          ) : null}
        </div>

        {/* Honeypot for spam bots: hidden from people and skipped by tab. */}
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <label htmlFor="website">Leave this field empty</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {state?.message && (
          <p role="alert" className="text-sm text-danger">
            {state.message}
          </p>
        )}

        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </div>
  );
}
