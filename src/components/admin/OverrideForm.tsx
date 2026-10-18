"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { saveDateOverride } from "@/app/admin/availability/actions";

export default function OverrideForm({ minDate }: { minDate: string }) {
  const [state, formAction, pending] = useActionState(
    saveDateOverride,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <FormField
        label="Date"
        name="date"
        type="date"
        min={minDate}
        required
        errors={state?.errors?.date}
      />

      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" name="isClosed" />
        Closed all day
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Open from"
          name="startTime"
          type="time"
          errors={state?.errors?.startTime}
        />
        <FormField
          label="Open until"
          name="endTime"
          type="time"
          errors={state?.errors?.endTime}
        />
      </div>

      {state?.message && (
        <p role="status" className="text-sm text-muted">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save Override"}
      </Button>
    </form>
  );
}
