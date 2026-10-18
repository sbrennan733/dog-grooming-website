"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { inputClassName, labelClassName } from "@/components/ui/form-styles";
import type { DogFormState } from "@/lib/validations/dog";

interface DogFormProps {
  action: (state: DogFormState, formData: FormData) => Promise<DogFormState>;
  defaultValues?: {
    name: string;
    breed: string;
    age: number;
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
