"use client";

import { useState } from "react";
import { markAssessmentComplete } from "@/app/admin/actions";

export default function MarkAssessmentButton({ dogId }: { dogId: string }) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    await markAssessmentComplete(dogId);
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-900 transition hover:bg-gray-100 disabled:opacity-50"
    >
      {pending ? "Saving..." : "Mark Assessment Complete"}
    </button>
  );
}
