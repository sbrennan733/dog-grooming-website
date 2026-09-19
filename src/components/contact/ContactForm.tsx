"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Button from "@/components/ui/Button";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type ContactFormErrors = Partial<Record<keyof ContactFormData, string>>;

const initialFormData: ContactFormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

function validate(data: ContactFormData): ContactFormErrors {
  const errors: ContactFormErrors = {};

  if (!data.name.trim()) {
    errors.name = "Please enter your name.";
  }

  if (!data.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!data.subject.trim()) {
    errors.subject = "Please enter a subject.";
  }

  if (!data.message.trim()) {
    errors.message = "Please enter a message.";
  } else if (data.message.trim().length < 10) {
    errors.message = "Please provide a little more detail (at least 10 characters).";
  }

  return errors;
}

const inputStyles =
  "w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black";

const labelStyles = "mb-1 block font-medium text-gray-900";

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // No backend exists yet — once /api/contact is built, this will POST
    // formData there for server-side validation and storage instead.
    console.log("Contact form submitted:", formData);

    setIsSubmitted(true);
    setFormData(initialFormData);
  }

  if (isSubmitted) {
    return (
      <div>
        <h2 className="mb-6 text-3xl font-bold text-gray-900">
          Send a Message
        </h2>

        <div
          role="status"
          className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-gray-700"
        >
          Thanks for reaching out — we&apos;ll get back to you as soon as
          possible.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-3xl font-bold text-gray-900">
        Send a Message
      </h2>

      <form noValidate onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className={labelStyles}>
            Name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={inputStyles}
          />

          {errors.name && (
            <p id="name-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className={labelStyles}>
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={inputStyles}
          />

          {errors.email && (
            <p id="email-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="subject" className={labelStyles}>
            Subject
          </label>

          <input
            id="subject"
            name="subject"
            type="text"
            required
            value={formData.subject}
            onChange={handleChange}
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={errors.subject ? "subject-error" : undefined}
            className={inputStyles}
          />

          {errors.subject && (
            <p id="subject-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.subject}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="message" className={labelStyles}>
            Message
          </label>

          <textarea
            id="message"
            name="message"
            rows={5}
            required
            value={formData.message}
            onChange={handleChange}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "message-error" : undefined}
            className={inputStyles}
          />

          {errors.message && (
            <p id="message-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full sm:w-auto">
          Send Message
        </Button>
      </form>
    </div>
  );
}
