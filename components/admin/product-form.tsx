"use client";

import { useActionState } from "react";
import { saveProductAction } from "@/app/admin/actions";
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
import type { AdminOption, AdminProduct } from "@/types/admin";
import { initialAdminActionState } from "@/types/admin";

interface ProductFormProps {
  categories: AdminOption[];
  product?: AdminProduct;
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const [state, action] = useActionState(saveProductAction, initialAdminActionState);
  const isEditing = Boolean(product);

  return (
    <form
      action={action}
      encType="multipart/form-data"
      className="grid gap-4 rounded-[1.75rem] border-2 border-[var(--color-accent-dark)] bg-[var(--color-bg-white)] p-5"
    >
      <input type="hidden" name="id" value={product?.id ?? ""} />
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cheese-500">
          {isEditing ? "Edit Product" : "New Product"}
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-ink-950">
          {isEditing ? product?.name : "Add a premium product"}
        </h3>
      </div>
      <AdminFormMessage state={state} />

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Category" error={state.fieldErrors.categoryId}>
          <AdminSelect name="categoryId" defaultValue={product?.categoryId ?? categories[0]?.value ?? ""}>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </AdminSelect>
        </AdminField>
        <AdminField label="Name" error={state.fieldErrors.name}>
          <AdminInput name="name" defaultValue={product?.name ?? ""} placeholder="Aged Cheddar Block" />
        </AdminField>
        <AdminField label="Slug" error={state.fieldErrors.slug}>
          <AdminInput name="slug" defaultValue={product?.slug ?? ""} placeholder="aged-cheddar-block" />
        </AdminField>
        <AdminField label="SKU">
          <AdminInput name="sku" defaultValue={product?.sku ?? ""} placeholder="HCS-CHED-400" />
        </AdminField>
      </div>

      <AdminField label="Short description">
        <AdminTextarea
          name="shortDescription"
          defaultValue={product?.shortDescription ?? ""}
          placeholder="A short product summary for admin and card views."
          className="min-h-24"
        />
      </AdminField>

      <AdminField label="Full description">
        <AdminTextarea
          name="description"
          defaultValue={product?.description ?? ""}
          placeholder="Longer description for product details and richer merchandising."
        />
      </AdminField>

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Price" error={state.fieldErrors.regularPrice}>
          <AdminInput type="number" step="0.01" min="0" name="regularPrice" defaultValue={product?.regularPrice ?? 0} />
        </AdminField>
        <AdminField label="Sale price" error={state.fieldErrors.salePrice}>
          <AdminInput
            type="number"
            step="0.01"
            min="0"
            name="salePrice"
            defaultValue={product?.salePrice ?? ""}
            placeholder="Optional"
          />
        </AdminField>
        <AdminField label="Unit label">
          <AdminInput
            name="unitLabel"
            defaultValue={product?.unitLabel ?? "unit"}
            placeholder="400g"
          />
        </AdminField>
        <AdminField label="Stock quantity" error={state.fieldErrors.stockQuantity}>
          <AdminInput type="number" min="0" name="stockQuantity" defaultValue={product?.stockQuantity ?? 0} />
        </AdminField>
      </div>

      <AdminImageUploadField
        label="Primary image"
        previewAlt={product?.name ?? "Product preview"}
        uploadName="imageFile"
        urlName="imageUrl"
        defaultUrl={product?.imageUrl ?? ""}
        error={state.fieldErrors.imageUrl}
      />

      <AdminField
        label="Gallery URLs"
        hint="Add one image URL per line. These will be stored as a gallery array."
      >
        <AdminTextarea
          name="galleryUrls"
          defaultValue={product?.galleryUrls.join("\n") ?? ""}
          placeholder={"https://...\nhttps://..."}
        />
      </AdminField>

      <div className="grid gap-3 md:grid-cols-2">
        <AdminToggle
          name="isFeatured"
          label="Feature this product"
          description="Featured products can be elevated in premium homepage sections."
          defaultChecked={product?.isFeatured ?? false}
        />
        <AdminToggle
          name="isActive"
          label="Active product"
          description="Inactive products stay in admin without showing in live catalogue pulls."
          defaultChecked={product?.isActive ?? true}
        />
      </div>

      <SubmitButton
        idleLabel={isEditing ? "Save Product" : "Create Product"}
        pendingLabel={isEditing ? "Saving..." : "Creating..."}
      />
    </form>
  );
}
