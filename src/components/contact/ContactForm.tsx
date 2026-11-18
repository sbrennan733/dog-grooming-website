"use client";

import { useActionState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import {
  inputClassName,
  labelClassName,
} from "@/components/ui/form-styles";
import { sendContactMessage } from "@/app/contact/actions";

interface ContactFormProps {
  dogs: { id: string; name: string; breed: string }[];
  // Shown so the customer can see which account the message is sent from.
  email: string;
}

export default function ContactForm({ dogs, email }: ContactFormProps) {
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

  const dogErrors = state?.errors?.dogId;
  const messageErrors = state?.errors?.message;

  return (
    <div>
      <h2 className="mb-2 text-3xl text-ink">Send a Message</h2>

      <p className="mb-6 text-muted">
        We&apos;ll reply to <strong className="text-ink">{email}</strong>.
      </p>

      <form action={formAction} className="space-y-5">
        <div>
          <label htmlFor="dogId" className={labelClassName}>
            Which dog is this about?
          </label>

          <select
            id="dogId"
            name="dogId"
            required
            defaultValue={state?.values?.dogId ?? ""}
            aria-invalid={Boolean(dogErrors?.length)}
            aria-describedby={dogErrors?.length ? "dogId-error" : undefined}
            className={inputClassName}
          >
            <option value="" disabled>
              Choose a dog
            </option>
            {dogs.map((dog) => (
              <option key={dog.id} value={dog.id}>
                {dog.name} ({dog.breed})
              </option>
            ))}
          </select>

          {dogErrors?.length ? (
            <div id="dogId-error" role="alert">
              {dogErrors.map((error) => (
                <p key={error} className="mt-1 text-sm text-danger">
                  {error}
                </p>
              ))}
            </div>
          ) : null}
        </div>

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

        {state?.message && (
          <p role="alert" className="text-sm text-danger">
            {state.message}
          </p>
        )}

        <p className="text-sm text-muted">
          We only use your details to reply to your message. See our{" "}
          <Link
            href="/privacy"
            className="font-bold text-brand hover:underline"
          >
            Privacy Notice
          </Link>
          .
        </p>

        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </div>
  );
}
