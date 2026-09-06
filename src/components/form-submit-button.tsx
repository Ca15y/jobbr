"use client";

import { useFormStatus } from "react-dom";

export function FormSubmitButton({ idleLabel = "Save application" }: { idleLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="button button-primary" disabled={pending}>
      {pending ? "Saving..." : idleLabel}
    </button>
  );
}
