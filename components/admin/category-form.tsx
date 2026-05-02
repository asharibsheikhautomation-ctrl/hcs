"use client";

import { useActionState } from "react";
import { saveCategoryAction } from "@/app/admin/actions";
import { AdminImageUploadField } from "@/components/admin/image-upload-field";
import {
  AdminField,
  AdminFormMessage,
  AdminInput,
  AdminTextarea,
  AdminToggle,
} from "@/components/admin/form-primitives";
import { SubmitButton } from "@/components/admin/submit-button";
import type { AdminCategory } from "@/types/admin";
import { initialAdminActionState } from "@/types/admin";

export function CategoryForm({ category }: { category?: AdminCategory }) {
  const [state, action] = useActionState(saveCategoryAction, initialAdminActionState);
  const isEditing = Boolean(category);

  return (
    <form
      action={action}
      encType="multipart/form-data"
      className="grid gap-4 rounded-[1.75rem] border-2 border-[var(--color-accent-dark)] bg-[var(--color-bg-white)] p-5"
    >
      <input type="hidden" name="id" value={category?.id ?? ""} />
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cheese-500">
          {isEditing ? "Edit Category" : "New Category"}
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-ink-950">
          {isEditing ? category?.name : "Create a catalogue section"}
        </h3>
      </div>
      <AdminFormMessage state={state} />
      <AdminField label="Name" error={state.fieldErrors.name}>
        <AdminInput name="name" defaultValue={category?.name ?? ""} placeholder="Frozen Food" />
      </AdminField>
      <AdminField label="Slug" error={state.fieldErrors.slug}>
        <AdminInput name="slug" defaultValue={category?.slug ?? ""} placeholder="frozen-food" />
      </AdminField>
      <AdminField label="Description">
        <AdminTextarea
          name="description"
          defaultValue={category?.description ?? ""}
          placeholder="Short premium description for this category."
        />
      </AdminField>
      <AdminImageUploadField
        label="Image"
        previewAlt={category?.name ?? "Category preview"}
        uploadName="imageFile"
        urlName="imageUrl"
        defaultUrl={category?.imageUrl ?? ""}
        error={state.fieldErrors.imageUrl}
      />
      <AdminField label="Sort order" error={state.fieldErrors.sortOrder}>
        <AdminInput
          type="number"
          min="0"
          name="sortOrder"
          defaultValue={category?.sortOrder ?? 0}
        />
      </AdminField>
      <AdminToggle
        name="isActive"
        label="Active category"
        description="Inactive categories stay in the database but can be hidden from the storefront."
        defaultChecked={category?.isActive ?? true}
      />
      <SubmitButton
        idleLabel={isEditing ? "Save Category" : "Create Category"}
        pendingLabel={isEditing ? "Saving..." : "Creating..."}
      />
    </form>
  );
}
