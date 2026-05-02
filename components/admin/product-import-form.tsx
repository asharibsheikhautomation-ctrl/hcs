"use client";

import { useActionState } from "react";
import { importProductsCsvAction } from "@/app/admin/actions";
import {
  AdminField,
  AdminFormMessage,
  AdminInput,
} from "@/components/admin/form-primitives";
import { SubmitButton } from "@/components/admin/submit-button";
import { initialAdminImportActionState } from "@/types/admin";

const PRODUCT_CSV_COLUMNS = [
  "name",
  "category",
  "description",
  "price",
  "sale_price",
  "image_url",
  "is_active",
];

export function ProductImportForm() {
  const [state, action] = useActionState(
    importProductsCsvAction,
    initialAdminImportActionState,
  );

  return (
    <form
      action={action}
      encType="multipart/form-data"
      className="grid gap-4 rounded-[1.75rem] border-2 border-[var(--color-accent-dark)] bg-[var(--color-bg-white)] p-5 md:p-6"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cheese-500">
          Bulk update
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-ink-950 md:text-3xl">
          Import products from CSV
        </h3>
        <p className="mt-3 text-sm leading-7 text-ink-700/78">
          Upload one simple CSV file to add new products or update existing ones
          by product name.
        </p>
      </div>

      <AdminFormMessage state={state} />

      <AdminField
        label="CSV file"
        error={state.fieldErrors.file}
        hint="CSV only for now. The file should include the product columns shown below."
      >
        <div className="rounded-[1.4rem] border-2 border-dashed border-[var(--color-accent-dark)] bg-[var(--color-bg-light)] p-4">
          <AdminInput
            type="file"
            name="file"
            accept=".csv,text/csv"
            className="w-full cursor-pointer file:mr-4 file:rounded-full file:border-0 file:bg-[var(--color-accent)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--color-text-dark)]"
          />
        </div>
      </AdminField>

      <div className="flex flex-wrap gap-2">
        {PRODUCT_CSV_COLUMNS.map((column) => (
          <span
            key={column}
            className="rounded-full border-2 border-[rgba(224,123,0,0.24)] bg-[var(--color-bg-light)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]"
          >
            {column}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <SubmitButton
          idleLabel="Import Products"
          pendingLabel="Importing..."
          className="w-full justify-center md:w-auto"
        />

        <a
          href="/admin/export/products"
          className="btn-base btn-secondary w-full justify-center rounded-[1.25rem] px-6 py-4 md:w-auto"
        >
          Export Products CSV
        </a>
      </div>
    </form>
  );
}
