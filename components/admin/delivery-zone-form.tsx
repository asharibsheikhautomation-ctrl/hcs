"use client";

import { useActionState } from "react";
import { saveDeliveryZoneAction } from "@/app/admin/actions";
import {
  AdminField,
  AdminFormMessage,
  AdminInput,
  AdminTextarea,
  AdminToggle,
} from "@/components/admin/form-primitives";
import { SubmitButton } from "@/components/admin/submit-button";
import type { AdminDeliveryZone } from "@/types/admin";
import { initialAdminActionState } from "@/types/admin";

export function DeliveryZoneForm({
  zone,
}: {
  zone?: AdminDeliveryZone;
}) {
  const [state, action] = useActionState(
    saveDeliveryZoneAction,
    initialAdminActionState,
  );
  const isEditing = Boolean(zone);

  return (
    <form action={action} className="grid gap-4 rounded-[1.75rem] border border-black/6 bg-white/75 p-5">
      <input type="hidden" name="id" value={zone?.id ?? ""} />
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cheese-500">
          {isEditing ? "Edit Zone" : "New Zone"}
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-ink-950">
          {isEditing ? zone?.name : "Create a delivery zone"}
        </h3>
      </div>
      <AdminFormMessage state={state} />
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Zone name" error={state.fieldErrors.name}>
          <AdminInput name="name" defaultValue={zone?.name ?? ""} placeholder="Latifabad" />
        </AdminField>
        <AdminField
          label="Slug (optional)"
          error={state.fieldErrors.slug}
          hint="Leave this empty and it will be created automatically."
        >
          <AdminInput name="slug" defaultValue={zone?.slug ?? ""} placeholder="latifabad" />
        </AdminField>
        <AdminField label="Delivery charge" error={state.fieldErrors.deliveryCharge}>
          <AdminInput
            type="number"
            step="0.01"
            min="0"
            name="deliveryCharge"
            defaultValue={zone?.deliveryCharge ?? 0}
          />
        </AdminField>
        <AdminField
          label="Minimum order for free delivery"
          error={state.fieldErrors.freeDeliveryMinimum}
        >
          <AdminInput
            type="number"
            step="0.01"
            min="0"
            name="freeDeliveryMinimum"
            defaultValue={zone?.freeDeliveryMinimum ?? 0}
          />
        </AdminField>
        <AdminField label="Estimated delivery time">
          <AdminInput
            name="estimatedDeliveryTime"
            defaultValue={zone?.estimatedDeliveryTime ?? ""}
            placeholder="30-45 mins"
          />
        </AdminField>
        <AdminField label="Sort order" error={state.fieldErrors.sortOrder}>
          <AdminInput
            type="number"
            min="0"
            name="sortOrder"
            defaultValue={zone?.sortOrder ?? 0}
          />
        </AdminField>
      </div>
      <AdminField label="Description">
        <AdminTextarea
          name="description"
          defaultValue={zone?.description ?? ""}
          placeholder="Route, coverage, and operating notes for this zone."
        />
      </AdminField>
      <AdminToggle
        name="isActive"
        label="Active zone"
        description="Inactive zones remain in admin but are not available in live checkout selection."
        defaultChecked={zone?.isActive ?? true}
      />
      <SubmitButton
        idleLabel={isEditing ? "Save Zone" : "Create Zone"}
        pendingLabel={isEditing ? "Saving..." : "Creating..."}
      />
    </form>
  );
}
