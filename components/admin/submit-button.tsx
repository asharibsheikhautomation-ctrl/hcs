"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

interface SubmitButtonProps {
  idleLabel: string;
  pendingLabel?: string;
  className?: string;
}

export function SubmitButton({
  idleLabel,
  pendingLabel = "Saving...",
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "btn-base btn-dark text-base",
        className,
      )}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
