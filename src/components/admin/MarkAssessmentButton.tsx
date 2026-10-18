"use client";

import { useState } from "react";
import { markAssessmentComplete } from "@/app/admin/actions";

export default function MarkAssessmentButton({
  dogId,
  dogName,
}: {
  dogId: string;
  dogName: string;
}) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    await markAssessmentComplete(dogId);
    setPending(false);
  }

  return (
    <button
      type="button"
      aria-label={`Mark assessment complete for ${dogName}`}
      onClick={handleClick}
      disabled={pending}
      className="rounded-full border-2 border-line px-4 py-1.5 text-sm font-bold text-ink transition hover:bg-surface-alt disabled:opacity-50"
    >
      {pending ? "Saving..." : "Mark Assessment Complete"}
    </button>
  );
}
