"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  initialContactInquiryState,
  submitContactInquiryAction,
} from "@/app/(store)/contact/actions";
import { cn } from "@/lib/utils";

const fallbackContactInquiryState = {
  status: "idle" as const,
  message: "",
  fieldErrors: {
    customerName: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  },
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-base btn-primary w-full"
    >
      {pending ? "Saving inquiry..." : "Send inquiry"}
    </button>
  );
}

function FieldError({ error }: { error?: string }) {
  if (!error) {
    return null;
  }

  return <p className="text-xs font-semibold text-red-600">{error}</p>;
}

export function ContactInquiryForm() {
  const [hookState, action] = useActionState(
    submitContactInquiryAction,
    initialContactInquiryState,
  );
  const state =
    hookState && typeof hookState === "object"
      ? {
          status: hookState.status ?? fallbackContactInquiryState.status,
          message: hookState.message ?? fallbackContactInquiryState.message,
          fieldErrors: hookState.fieldErrors ?? fallbackContactInquiryState.fieldErrors,
        }
      : fallbackContactInquiryState;
  const fieldErrors = {
    customerName: state.fieldErrors?.customerName ?? "",
    phone: state.fieldErrors?.phone ?? "",
    email: state.fieldErrors?.email ?? "",
    subject: state.fieldErrors?.subject ?? "",
    message: state.fieldErrors?.message ?? "",
  };

  return (
    <form action={action} className="grid gap-4 rounded-[2rem] border border-cheese-200/70 bg-cheese-50 p-6 shadow-[0_12px_30px_rgba(141,97,8,0.12)] md:p-7">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cheese-500">
          Inquiry Form
        </p>
        <h2 className="mt-3 text-[2.1rem] font-semibold leading-[0.96] text-ink-950 sm:text-4xl">
          Send a quick message.
        </h2>
        <p className="mt-3 text-sm leading-6 text-ink-700/76">
          Saved straight to the store inbox.
        </p>
      </div>

      {state.message ? (
        <div
          className={cn(
            "rounded-[1.25rem] px-4 py-3 text-sm",
            state.status === "success"
              ? "border border-cheese-300 bg-cheese-100/70 text-ink-950"
              : state.status === "error"
                ? "border border-red-200 bg-red-50 text-red-700"
                : "border border-black/8 bg-surface-muted text-ink-700",
          )}
        >
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-ink-800">
          <span>Name</span>
          <input
            name="customerName"
            className="field-input"
            placeholder="Your name"
          />
          <FieldError error={fieldErrors.customerName} />
        </label>

        <label className="grid gap-2 text-sm font-medium text-ink-800">
          <span>Phone</span>
          <input
            name="phone"
            className="field-input"
            placeholder="03XXXXXXXXX"
          />
          <FieldError error={fieldErrors.phone} />
        </label>

        <label className="grid gap-2 text-sm font-medium text-ink-800">
          <span>Email</span>
          <input
            type="email"
            name="email"
            className="field-input"
            placeholder="you@example.com"
          />
          <FieldError error={fieldErrors.email} />
        </label>

        <label className="grid gap-2 text-sm font-medium text-ink-800">
          <span>Subject</span>
          <input
            name="subject"
            className="field-input"
            placeholder="Order help, stock, partnership"
          />
          <FieldError error={fieldErrors.subject} />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-ink-800">
        <span>Message</span>
        <textarea
          name="message"
          className="field-textarea min-h-36"
          placeholder="What do you need?"
        />
        <FieldError error={fieldErrors.message} />
      </label>

      <SubmitButton />
    </form>
  );
}
