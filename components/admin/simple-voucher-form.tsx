"use client";

import { useActionState } from "react";
import { deleteVoucherAction, saveVoucherAction } from "@/app/admin/actions";
import {
  AdminField,
  AdminFormMessage,
  AdminInput,
  AdminSelect,
  AdminToggle,
} from "@/components/admin/form-primitives";
import { SubmitButton } from "@/components/admin/submit-button";
import type { AdminVoucher } from "@/types/admin";
import { initialAdminActionState } from "@/types/admin";

interface SimpleVoucherFormProps {
  voucher?: AdminVoucher;
}

export function SimpleVoucherForm({ voucher }: SimpleVoucherFormProps) {
  const [state, action] = useActionState(
    saveVoucherAction,
    initialAdminActionState,
  );
  const isEditing = Boolean(voucher);

  return (
    <form
      action={action}
      className="grid gap-4 rounded-[1.75rem] border-2 border-[var(--color-accent-dark)] bg-[var(--color-bg-white)] p-5 md:p-6"
    >
      <input type="hidden" name="id" value={voucher?.id ?? ""} />

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cheese-500">
          {isEditing ? "Edit voucher" : "Add voucher"}
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-ink-950 md:text-3xl">
          {isEditing ? voucher?.name : "Create a voucher"}
        </h3>
      </div>

      <AdminFormMessage state={state} />

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Voucher name" error={state.fieldErrors.name}>
          <AdminInput
            name="name"
            defaultValue={voucher?.name ?? ""}
            placeholder="Restaurant Saver"
          />
        </AdminField>

        <AdminField
          label="Voucher code"
          error={state.fieldErrors.code}
          hint="Example: HCS100 or DEAL-10"
        >
          <AdminInput
            name="code"
            defaultValue={voucher?.code ?? ""}
            placeholder="HCS100"
          />
        </AdminField>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField
          label="Discount type"
          error={state.fieldErrors.discountType}
        >
          <AdminSelect
            name="discountType"
            defaultValue={voucher?.discountType ?? "fixed"}
          >
            <option value="fixed">Fixed amount</option>
            <option value="percentage">Percentage</option>
          </AdminSelect>
        </AdminField>

        <AdminField
          label="Discount value"
          error={state.fieldErrors.discountValue}
        >
          <AdminInput
            type="number"
            step="0.01"
            min="0"
            name="discountValue"
            defaultValue={voucher?.discountValue ?? ""}
            placeholder="250"
          />
        </AdminField>

        <AdminField label="Valid until" error={state.fieldErrors.validUntil}>
          <AdminInput
            type="datetime-local"
            name="validUntil"
            defaultValue={voucher?.validUntil ? voucher.validUntil.slice(0, 16) : ""}
          />
        </AdminField>

        <AdminField
          label="Max uses"
          error={state.fieldErrors.maxUses}
          hint="Leave blank for unlimited use."
        >
          <AdminInput
            type="number"
            min="1"
            step="1"
            name="maxUses"
            defaultValue={voucher?.maxUses ?? ""}
            placeholder="50"
          />
        </AdminField>
      </div>

      {voucher ? (
        <div className="rounded-[1.35rem] border-2 border-[rgba(224,123,0,0.22)] bg-[var(--color-bg-light)] px-4 py-4 text-sm leading-6 text-ink-800">
          Used {voucher.timesUsed}
          {voucher.maxUses ? ` / ${voucher.maxUses}` : ""} times so far.
        </div>
      ) : null}

      <AdminToggle
        name="isActive"
        label="Voucher active"
        description="Turn this off to hide the code from checkout use."
        defaultChecked={voucher?.isActive ?? true}
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <SubmitButton
          idleLabel={isEditing ? "Save Voucher" : "Add Voucher"}
          pendingLabel={isEditing ? "Saving..." : "Adding..."}
          className="w-full md:w-auto"
        />

        {voucher ? (
          <button
            type="submit"
            formAction={deleteVoucherAction}
            className="btn-base w-full rounded-[1.25rem] border border-red-200 bg-red-50 px-6 py-4 text-red-700 md:w-auto"
          >
            Delete Voucher
          </button>
        ) : null}
      </div>
    </form>
  );
}
