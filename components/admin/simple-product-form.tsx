"use client";

import { useActionState } from "react";
import { saveSimpleProductAction } from "@/app/admin/actions";
import { AdminImageUploadField } from "@/components/admin/image-upload-field";
import {
  AdminField,
  AdminFormMessage,
  AdminInput,
  AdminSelect,
  AdminTextarea,
} from "@/components/admin/form-primitives";
import { SubmitButton } from "@/components/admin/submit-button";
import type { AdminOption, AdminProduct } from "@/types/admin";
import { initialAdminActionState } from "@/types/admin";

interface SimpleProductFormProps {
  categories: AdminOption[];
  product?: AdminProduct;
}

export function SimpleProductForm({
  categories,
  product,
}: SimpleProductFormProps) {
  const [state, action] = useActionState(
    saveSimpleProductAction,
    initialAdminActionState,
  );
  const isEditing = Boolean(product);

  return (
    <form
      action={action}
      encType="multipart/form-data"
      className="grid gap-4 rounded-[1.75rem] border border-black/6 bg-white/82 p-5 md:p-6"
    >
      <input type="hidden" name="id" value={product?.id ?? ""} />

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cheese-500">
          {isEditing ? "Edit product" : "Add product"}
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-ink-950 md:text-3xl">
          {isEditing ? product?.name : "Add a new product"}
        </h3>
      </div>

      <AdminFormMessage state={state} />

      <AdminField label="Product name" error={state.fieldErrors.name}>
        <AdminInput
          name="name"
          defaultValue={product?.name ?? ""}
          placeholder="Aged Cheddar Block"
        />
      </AdminField>

      <AdminField label="Category" error={state.fieldErrors.categoryId}>
        <AdminSelect
          name="categoryId"
          defaultValue={product?.categoryId ?? categories[0]?.value ?? ""}
        >
          {categories.length > 0 ? (
            categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))
          ) : (
            <option value="">Create a category first</option>
          )}
        </AdminSelect>
      </AdminField>

      <AdminField label="Description" error={state.fieldErrors.description}>
        <AdminTextarea
          name="description"
          defaultValue={product?.description ?? ""}
          placeholder="Short, clear product description for customers."
          className="min-h-28"
        />
      </AdminField>

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Price" error={state.fieldErrors.price}>
          <AdminInput
            type="number"
            step="0.01"
            min="0"
            name="price"
            defaultValue={product?.salePrice ?? product?.regularPrice ?? ""}
            placeholder="2250"
          />
        </AdminField>
      </div>

      <AdminImageUploadField
        label="Product image"
        previewAlt={product?.name ?? "Product preview"}
        uploadName="imageFile"
        urlName="imageUrl"
        defaultUrl={product?.imageUrl ?? ""}
        error={state.fieldErrors.imageUrl}
      />

      <SubmitButton
        idleLabel={isEditing ? "Save Product" : "Add Product"}
        pendingLabel={isEditing ? "Saving..." : "Adding..."}
        className="w-full md:w-auto"
      />
    </form>
  );
}
