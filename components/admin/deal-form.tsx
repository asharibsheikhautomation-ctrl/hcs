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

interface DealFormProps {
  products: AdminOption[];
  deal?: AdminDeal;
}

export function DealForm({ products, deal }: DealFormProps) {
  const [state, action] = useActionState(saveDealAction, initialAdminActionState);
  const isEditing = Boolean(deal);
  const linkedProductIds = new Set(deal?.linkedProductIds ?? []);

  return (
    <form
      action={action}
      encType="multipart/form-data"
      className="grid gap-4 rounded-[1.75rem] border-2 border-[var(--color-accent-dark)] bg-[var(--color-bg-white)] p-5"
    >
      <input type="hidden" name="id" value={deal?.id ?? ""} />
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cheese-500">
          {isEditing ? "Edit Deal" : "New Deal"}
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-ink-950">
          {isEditing ? deal?.title : "Launch a campaign"}
        </h3>
      </div>
      <AdminFormMessage state={state} />

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Title" error={state.fieldErrors.title}>
          <AdminInput name="title" defaultValue={deal?.title ?? ""} placeholder="Weekend Gathering Box" />
        </AdminField>
        <AdminField label="Slug" error={state.fieldErrors.slug}>
          <AdminInput name="slug" defaultValue={deal?.slug ?? ""} placeholder="weekend-gathering-box" />
        </AdminField>
      </div>

      <AdminField label="Description" error={state.fieldErrors.description}>
        <AdminTextarea
          name="description"
          defaultValue={deal?.description ?? ""}
          placeholder="Describe the bundle and why it feels premium."
        />
      </AdminField>

      <AdminImageUploadField
        label="Banner image"
        previewAlt={deal?.title ?? "Deal preview"}
        uploadName="bannerImageFile"
        urlName="bannerImageUrl"
        defaultUrl={deal?.bannerImageUrl ?? ""}
        error={state.fieldErrors.bannerImageUrl}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Discount type" error={state.fieldErrors.discountType}>
          <AdminSelect name="discountType" defaultValue={deal?.discountType ?? "percentage"}>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed amount</option>
            <option value="bundle">Bundle savings</option>
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

      <div className="grid gap-3 rounded-[1.5rem] border-2 border-[rgba(224,123,0,0.24)] bg-[var(--color-bg-light)] p-4">
        <div>
          <p className="text-sm font-semibold text-ink-950">Linked products</p>
          <p className="mt-1 text-xs leading-6 text-ink-700/70">
            Select one or more products to associate with this deal.
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
      </div>

      <AdminToggle
        name="isActive"
        label="Active deal"
        description="Inactive deals stay editable in admin but should not surface in live campaign pulls."
        defaultChecked={deal?.isActive ?? true}
      />
      <AdminToggle
        name="isFeatured"
        label="Feature on homepage"
        description="Featured deals are eligible for homepage highlights and premium campaign placements."
        defaultChecked={deal?.isFeatured ?? false}
      />

      <SubmitButton
        idleLabel={isEditing ? "Save Deal" : "Create Deal"}
        pendingLabel={isEditing ? "Saving..." : "Creating..."}
      />
    </form>
  );
}
