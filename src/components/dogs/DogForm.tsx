"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { inputClassName, labelClassName } from "@/components/ui/form-styles";
import Link from "next/link";
import { dogSizeLabels, dogSizeValues } from "@/lib/dog-size";
import type { DogFormState } from "@/lib/validations/dog";
import type { DogSize } from "@/generated/prisma/client";

interface DogFormProps {
  action: (state: DogFormState, formData: FormData) => Promise<DogFormState>;
  defaultValues?: {
    name: string;
    breed: string;
    age: number;
    size: DogSize;
    notes: string | null;
  };
  submitLabel: string;
}

export default function DogForm({
  action,
  defaultValues,
  submitLabel,
}: DogFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <FormField
        label="Name"
        name="name"
        type="text"
        required
        defaultValue={defaultValues?.name}
        errors={state?.errors?.name}
      />

      <FormField
        label="Breed"
        name="breed"
        type="text"
        required
        defaultValue={defaultValues?.breed}
        errors={state?.errors?.breed}
      />

      <FormField
        label="Age"
        name="age"
        type="number"
        required
        min={0}
        max={30}
        defaultValue={defaultValues?.age}
        errors={state?.errors?.age}
      />

      <fieldset
        aria-describedby={state?.errors?.size ? "size-error" : undefined}
      >
        <legend className={labelClassName}>Size</legend>

        <div className="flex flex-wrap gap-3">
          {dogSizeValues.map((size) => (
            <label
              key={size}
              className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-line-input bg-surface px-4 py-2 font-semibold text-ink has-[:checked]:border-brand has-[:checked]:bg-surface-alt"
            >
              <input
                type="radio"
                name="size"
                value={size}
                required
                defaultChecked={defaultValues?.size === size}
              />
              {dogSizeLabels[size]}
            </label>
          ))}
        </div>

        <p className="mt-2 text-sm text-muted">
          Size decides the price of each groom. Unsure which fits your dog?{" "}
          <Link href="/contact" className="font-bold text-brand hover:underline">
            Message us
          </Link>
          .
        </p>

        {state?.errors?.size?.map((error) => (
          <p
            key={error}
            id="size-error"
            role="alert"
            className="mt-1 text-sm text-danger"
          >
            {error}
          </p>
        ))}
      </fieldset>

      <div>
        <label
          htmlFor="notes"
          className={labelClassName}
        >
          Notes <span className="font-normal text-muted">(optional)</span>
        </label>

        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={defaultValues?.notes ?? ""}
          aria-invalid={Boolean(state?.errors?.notes)}
          aria-describedby={state?.errors?.notes ? "notes-error" : undefined}
          className={inputClassName}
        />

        {state?.errors?.notes?.map((error) => (
          <p
            key={error}
            id="notes-error"
            role="alert"
            className="mt-1 text-sm text-danger"
          >
            {error}
          </p>
        ))}
      </div>

      {state?.message && (
        <p role="alert" className="text-sm text-danger">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
