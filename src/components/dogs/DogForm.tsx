"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
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
          className="mb-1 block font-medium text-gray-900"
        >
          Notes <span className="font-normal text-gray-500">(optional)</span>
        </label>

        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={defaultValues?.notes ?? ""}
          aria-invalid={Boolean(state?.errors?.notes)}
          aria-describedby={state?.errors?.notes ? "notes-error" : undefined}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />

        {state?.errors?.notes?.map((error) => (
          <p
            key={error}
            id="notes-error"
            role="alert"
            className="mt-1 text-sm text-red-600"
          >
            {error}
          </p>
        ))}
      </div>

      {state?.message && (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
