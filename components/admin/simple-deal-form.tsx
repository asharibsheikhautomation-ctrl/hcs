"use client";

import { useActionState } from "react";
import { saveDealAction } from "@/app/admin/actions";
import { AdminImageUploadField } from "@/components/admin/image-upload-field";
import {
  AdminField,
  AdminFormMessage,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminToggle,
} from "@/components/admin/form-primitives";
import { SubmitButton } from "@/components/admin/submit-button";
import type { AdminDeal, AdminOption } from "@/types/admin";
import { initialAdminActionState } from "@/types/admin";

interface SimpleDealFormProps {
  products: AdminOption[];
  deal?: AdminDeal;
}

export function SimpleDealForm({ products, deal }: SimpleDealFormProps) {
  const [state, action] = useActionState(saveDealAction, initialAdminActionState);
  const isEditing = Boolean(deal);
  const linkedProductIds = new Set(deal?.linkedProductIds ?? []);

  return (
    <form
      action={action}
      className="grid gap-4 rounded-[1.75rem] border-2 border-[var(--color-accent-dark)] bg-[var(--color-bg-white)] p-5 md:p-6"
    >
      <input type="hidden" name="id" value={deal?.id ?? ""} />
      <input type="hidden" name="slug" value={deal?.slug ?? ""} />

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cheese-500">
          {isEditing ? "Edit deal" : "Add deal"}
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-ink-950 md:text-3xl">
          {isEditing ? deal?.title : "Create a deal"}
        </h3>
      </div>

      <AdminFormMessage state={state} />

      <AdminField label="Deal title" error={state.fieldErrors.title}>
        <AdminInput
          name="title"
          defaultValue={deal?.title ?? ""}
          placeholder="Weekend Cheese Box"
        />
      </AdminField>

      <AdminField label="Short description" error={state.fieldErrors.description}>
        <AdminTextarea
          name="description"
          defaultValue={deal?.description ?? ""}
          placeholder="Simple line for the offer."
          className="min-h-24"
        />
      </AdminField>

      <AdminImageUploadField
        label="Deal banner"
        previewAlt={deal?.title ?? "Deal preview"}
        uploadName="bannerImageFile"
        urlName="bannerImageUrl"
        defaultUrl={deal?.bannerImageUrl ?? ""}
        error={state.fieldErrors.bannerImageUrl}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Discount type" error={state.fieldErrors.discountType}>
          <AdminSelect
            name="discountType"
            defaultValue={deal?.discountType ?? "percentage"}
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed amount</option>
            <option value="bundle">Bundle</option>
          </AdminSelect>
        </AdminField>

        <AdminField label="Discount value" error={state.fieldErrors.discountValue}>
          <AdminInput
            type="number"
            step="0.01"
            min="0"
            name="discountValue"
            defaultValue={deal?.discountValue ?? 0}
          />
        </AdminField>

        <AdminField
          label="Offer price (optional)"
          error={state.fieldErrors.offerPrice}
          hint="If you set this, the system will auto-calculate the discount from the included items total."
        >
          <AdminInput
            type="number"
            step="0.01"
            min="0"
            name="offerPrice"
            defaultValue={deal?.includedValue ? deal.offerPrice : ""}
            placeholder="3500"
          />
        </AdminField>

        <AdminField label="Starts at">
          <AdminInput
            type="datetime-local"
            name="startsAt"
            defaultValue={deal?.startsAt ? deal.startsAt.slice(0, 16) : ""}
          />
        </AdminField>

        <AdminField label="Ends at" error={state.fieldErrors.endsAt}>
          <AdminInput
            type="datetime-local"
            name="endsAt"
            defaultValue={deal?.endsAt ? deal.endsAt.slice(0, 16) : ""}
          />
        </AdminField>
      </div>

      {deal?.includedValue ? (
        <div className="rounded-[1.35rem] border-2 border-[rgba(224,123,0,0.22)] bg-[var(--color-bg-light)] px-4 py-4 text-sm leading-6 text-ink-800">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white px-3 py-1 font-semibold text-ink-950">
              Worth: Rs {deal.includedValue.toLocaleString("en-PK")}
            </span>
            <span className="rounded-full bg-[var(--color-primary)] px-3 py-1 font-semibold text-white">
              Offer: Rs {deal.offerPrice.toLocaleString("en-PK")}
            </span>
            <span className="rounded-full bg-[var(--color-accent)] px-3 py-1 font-semibold text-black">
              Save: Rs {deal.savingsAmount.toLocaleString("en-PK")}
            </span>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 rounded-[1.5rem] border-2 border-[rgba(224,123,0,0.24)] bg-[var(--color-bg-light)] p-4">
        <div>
          <p className="text-sm font-semibold text-ink-950">Included products</p>
          <p className="mt-1 text-xs leading-6 text-ink-700/70">
            Select the actual products that this deal should include.
          </p>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          {products.map((product) => (
            <label
              key={product.value}
              className="flex items-center gap-3 rounded-[1.1rem] border-2 border-[rgba(224,123,0,0.22)] bg-[var(--color-bg-white)] px-4 py-3 text-sm text-ink-800"
            >
              <input
                type="checkbox"
                name="linkedProductIds"
                value={product.value}
                defaultChecked={linkedProductIds.has(product.value)}
                className="h-4 w-4 rounded border-[var(--color-accent-dark)] text-[var(--color-primary)] focus:ring-[var(--color-accent)]"
              />
              <span>{product.label}</span>
            </label>
          ))}
        </div>
        <div className="rounded-[1.2rem] border-2 border-dashed border-[rgba(224,123,0,0.22)] bg-[var(--color-bg-white)] px-4 py-4 text-sm leading-6 text-ink-700/72">
          Deals now use only products from your product list. Custom items have been removed to keep pricing and saving clean.
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <AdminToggle
          name="isActive"
          label="Show this deal"
          description="Turn this off when the deal should stay hidden."
          defaultChecked={deal?.isActive ?? true}
        />
        <AdminToggle
          name="isFeatured"
          label="Show on homepage"
          description="Use this for your main highlighted campaigns."
          defaultChecked={deal?.isFeatured ?? false}
        />
      </div>

      <SubmitButton
        idleLabel={isEditing ? "Save Deal" : "Add Deal"}
        pendingLabel={isEditing ? "Saving..." : "Adding..."}
        className="w-full md:w-auto"
      />
    </form>
  );
}
