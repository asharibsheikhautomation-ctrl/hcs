import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";
import type { AdminActionState } from "@/types/admin";

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

export function AdminField({
  label,
  error,
  hint,
  className,
  children,
}: FieldProps) {
  return (
    <label className={cn("grid gap-2 text-base font-medium text-ink-800", className)}>
      <span>{label}</span>
      {children}
      {hint ? <span className="text-xs leading-6 text-ink-700/65">{hint}</span> : null}
      {error ? (
        <span className="text-xs font-semibold text-red-600">{error}</span>
      ) : null}
    </label>
  );
}

const baseInputClassName =
  "field-input rounded-[1.25rem] px-4 py-3 text-base text-ink-950";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function AdminInput({ className, ...props }: InputProps) {
  return <input className={cn(baseInputClassName, className)} {...props} />;
}

export function AdminTextarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn("field-textarea rounded-[1.25rem] text-base", className)}
      {...props}
    />
  );
}

export function AdminSelect({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(baseInputClassName, className)} {...props}>
      {children}
    </select>
  );
}

interface ToggleProps {
  name: string;
  label: string;
  description: string;
  defaultChecked?: boolean;
}

export function AdminToggle({
  name,
  label,
  description,
  defaultChecked,
}: ToggleProps) {
  return (
    <label className="flex items-start gap-3 rounded-[1.25rem] border border-black/8 bg-white px-4 py-4 text-base text-ink-800">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 rounded border-black/20 text-cheese-500 focus:ring-cheese-300"
      />
      <span className="grid gap-1">
        <span className="font-semibold text-ink-950">{label}</span>
        <span className="text-xs leading-6 text-ink-700/70">{description}</span>
      </span>
    </label>
  );
}

export function AdminFormMessage({ state }: { state: AdminActionState }) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-[1.25rem] px-4 py-3 text-sm",
        state.status === "success"
          ? "border border-cheese-300 bg-cheese-100/70 text-ink-950"
          : "border border-red-200 bg-red-50 text-red-700",
      )}
    >
      <div className="space-y-3">
        <p>{state.message}</p>

        {state.details && state.details.length > 0 ? (
          <ul className="grid gap-2 pl-5 text-xs leading-6">
            {state.details.map((detail, index) => (
              <li key={`${detail}-${index}`} className="list-disc">
                {detail}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
