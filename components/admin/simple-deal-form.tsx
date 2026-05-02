"use client";

import { useActionState, useState } from "react";
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

interface CustomDealItemDraft {
  key: string;
  name: string;
  quantity: string;
  price: string;
  unitLabel: string;
  imageUrl: string;
}

function createDraftKey() {
  return `custom-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createEmptyCustomDealItem(): CustomDealItemDraft {
  return {
    key: createDraftKey(),
    name: "",
    quantity: "1",
    price: "",
    unitLabel: "",
    imageUrl: "",
  };
}

export function SimpleDealForm({ products, deal }: SimpleDealFormProps) {
  const [state, action] = useActionState(saveDealAction, initialAdminActionState);
  const isEditing = Boolean(deal);
  const linkedProductIds = new Set(deal?.linkedProductIds ?? []);
  const [customItems, setCustomItems] = useState<CustomDealItemDraft[]>(
    deal?.customItems.length
      ? deal.customItems.map((item) => ({
          key: item.id,
          name: item.name,
          quantity: String(item.quantity),
          price: String(item.price),
          unitLabel: item.unitLabel,
          imageUrl: item.imageUrl,
        }))
      : [createEmptyCustomDealItem()],
  );

  function updateCustomItem(
    key: string,
    field: Exclude<keyof CustomDealItemDraft, "key">,
    value: string,
  ) {
    setCustomItems((currentItems) =>
      currentItems.map((item) =>
        item.key === key ? { ...item, [field]: value } : item,
      ),
    );
  }

  function addCustomItemRow() {
    setCustomItems((currentItems) => [...currentItems, createEmptyCustomDealItem()]);
  }

  function removeCustomItemRow(key: string) {
    setCustomItems((currentItems) => {
      const nextItems = currentItems.filter((item) => item.key !== key);
      return nextItems.length > 0 ? nextItems : [createEmptyCustomDealItem()];
    });
  }

  return (
    <form
      action={action}
      encType="multipart/form-data"
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
          <p className="text-sm font-semibold text-ink-950">Included products</p>
          <p className="mt-1 text-xs leading-6 text-ink-700/70">
            Select store products that should be added when this deal is chosen.
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

      <div className="grid gap-3 rounded-[1.5rem] border-2 border-[rgba(224,123,0,0.24)] bg-[var(--color-bg-light)] p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink-950">Custom items</p>
            <p className="mt-1 text-xs leading-6 text-ink-700/70">
              Add manual items if a deal should include something that is not already in Products.
            </p>
          </div>

          <button
            type="button"
            onClick={addCustomItemRow}
            className="btn-base btn-secondary w-full justify-center rounded-[1.1rem] px-4 py-3 text-sm md:w-auto"
          >
            Add custom item
          </button>
        </div>

        {state.fieldErrors.customItems ? (
          <p className="text-xs font-semibold text-red-600">
            {state.fieldErrors.customItems}
          </p>
        ) : null}

        <div className="grid gap-3">
          {customItems.map((item, index) => (
            <div
              key={item.key}
              className="rounded-[1.2rem] border-2 border-[rgba(224,123,0,0.22)] bg-[var(--color-bg-white)] p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink-950">
                  Custom item {index + 1}
                </p>

                <button
                  type="button"
                  onClick={() => removeCustomItemRow(item.key)}
                  className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-red-700"
                >
                  Remove
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <AdminInput
                  name="customItemName"
                  value={item.name}
                  onChange={(event) =>
                    updateCustomItem(item.key, "name", event.currentTarget.value)
                  }
                  placeholder="Cheese Dip Cup"
                />
                <AdminInput
                  name="customItemUnitLabel"
                  value={item.unitLabel}
                  onChange={(event) =>
                    updateCustomItem(
                      item.key,
                      "unitLabel",
                      event.currentTarget.value,
                    )
                  }
                  placeholder="Cup / Box / 250g"
                />
                <AdminInput
                  type="number"
                  min="1"
                  step="1"
                  name="customItemQuantity"
                  value={item.quantity}
                  onChange={(event) =>
                    updateCustomItem(item.key, "quantity", event.currentTarget.value)
                  }
                  placeholder="1"
                />
                <AdminInput
                  type="number"
                  min="0"
                  step="0.01"
                  name="customItemPrice"
                  value={item.price}
                  onChange={(event) =>
                    updateCustomItem(item.key, "price", event.currentTarget.value)
                  }
                  placeholder="350"
                />
                <div className="md:col-span-2">
                  <AdminInput
                    name="customItemImageUrl"
                    value={item.imageUrl}
                    onChange={(event) =>
                      updateCustomItem(item.key, "imageUrl", event.currentTarget.value)
                    }
                    placeholder="https://... optional image URL"
                  />
                </div>
              </div>
            </div>
          ))}
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
