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

interface SimpleCategoryFormProps {
  category?: AdminCategory;
}

export function SimpleCategoryForm({ category }: SimpleCategoryFormProps) {
  const [state, action] = useActionState(saveCategoryAction, initialAdminActionState);
  const isEditing = Boolean(category);

  return (
    <form
      action={action}
      encType="multipart/form-data"
      className="grid gap-4 rounded-[1.75rem] border-2 border-[var(--color-accent-dark)] bg-[var(--color-bg-white)] p-5 md:p-6"
    >
      <input type="hidden" name="id" value={category?.id ?? ""} />

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cheese-500">
          {isEditing ? "Edit category" : "Add category"}
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-ink-950 md:text-3xl">
          {isEditing ? category?.name : "Create a category"}
        </h3>
      </div>

      <AdminFormMessage state={state} />

      <AdminField label="Category name" error={state.fieldErrors.name}>
        <AdminInput
          name="name"
          defaultValue={category?.name ?? ""}
          placeholder="Frozen Food"
        />
      </AdminField>

      <AdminField label="Short note">
        <AdminTextarea
          name="description"
          defaultValue={category?.description ?? ""}
          placeholder="Short line to help you recognize this section."
          className="min-h-24"
        />
      </AdminField>

      <div className="grid gap-4 md:grid-cols-2">
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
          label="Show this category"
          description="Turn this off only when you want to hide the category."
          defaultChecked={category?.isActive ?? true}
        />
      </div>

      <AdminImageUploadField
        label="Category image"
        previewAlt={category?.name ?? "Category preview"}
        uploadName="imageFile"
        urlName="imageUrl"
        defaultUrl={category?.imageUrl ?? ""}
        error={state.fieldErrors.imageUrl}
      />

      <SubmitButton
        idleLabel={isEditing ? "Save Category" : "Add Category"}
        pendingLabel={isEditing ? "Saving..." : "Adding..."}
        className="w-full md:w-auto"
      />
    </form>
  );
}
