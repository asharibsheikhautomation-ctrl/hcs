"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-[2rem] border border-red-200 bg-red-50 px-6 py-8">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-red-600">
        Admin Error
      </p>
      <h2 className="mt-3 text-3xl font-semibold text-ink-950 md:text-4xl">
        Something went wrong in the control room.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-700/80">
        {error.message || "The admin view could not be completed right now."}
      </p>
      <button
        type="button"
        onClick={unstable_retry}
        className="btn-base btn-dark mt-6"
      >
        Try again
      </button>
    </div>
  );
}
