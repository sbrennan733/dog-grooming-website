"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { addAvailableSlots } from "@/app/admin/availability/actions";
import { SLOT_TIME_OPTIONS } from "@/lib/validations/availability";

export default function AddSlotsForm({ minDate }: { minDate: string }) {
  const [state, formAction, pending] = useActionState(
    addAvailableSlots,
    undefined
  );

  return (
    <form action={formAction} className="space-y-5">
      <FormField
        label="Date"
        name="date"
        type="date"
        min={minDate}
        required
        defaultValue={state?.values?.date}
        errors={state?.errors?.date}
      />

      <fieldset aria-describedby={state?.errors?.times ? "times-error" : undefined}>
        <legend className="mb-1.5 block font-semibold text-ink">
          Start times to open
        </legend>

        <p className="mb-3 text-sm text-muted">
          Each grooming appointment holds about three hours, so only open
          start times that are far enough apart.
        </p>

        <div className="flex flex-wrap gap-2">
          {SLOT_TIME_OPTIONS.map((time) => (
            <label
              key={time}
              className="cursor-pointer rounded-full border-2 border-line-input bg-surface px-4 py-1.5 text-sm font-semibold text-ink has-[:checked]:border-brand has-[:checked]:bg-brand has-[:checked]:text-on-brand has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand"
            >
              <input
                type="checkbox"
                name="times"
                value={time}
                defaultChecked={state?.values?.times.includes(time)}
                className="sr-only"
              />
              {time}
            </label>
          ))}
        </div>

        {state?.errors?.times?.map((error) => (
          <p
            key={error}
            id="times-error"
            role="alert"
            className="mt-2 text-sm text-danger"
          >
            {error}
          </p>
        ))}
      </fieldset>

      {state?.message && (
        <p role="status" className="text-sm text-muted">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Open These Times"}
      </Button>
    </form>
  );
}
