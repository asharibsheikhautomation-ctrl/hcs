"use client";

import { useActionState } from "react";
import { saveDeliveryZoneAreaAction } from "@/app/admin/actions";
import {
  AdminField,
  AdminFormMessage,
  AdminInput,
  AdminSelect,
  AdminTextarea,
} from "@/components/admin/form-primitives";
import { SubmitButton } from "@/components/admin/submit-button";
import type { AdminDeliveryZoneArea, AdminOption } from "@/types/admin";
import { initialAdminActionState } from "@/types/admin";

interface DeliveryZoneAreaFormProps {
  zones: AdminOption[];
  area?: AdminDeliveryZoneArea;
  initialZoneId?: string;
}

export function DeliveryZoneAreaForm({
  zones,
  area,
  initialZoneId,
}: DeliveryZoneAreaFormProps) {
  const [state, action] = useActionState(
    saveDeliveryZoneAreaAction,
    initialAdminActionState,
  );
  const isEditing = Boolean(area);

  return (
    <form action={action} className="grid gap-4 rounded-[1.5rem] border border-black/6 bg-white/75 p-5">
      <input type="hidden" name="id" value={area?.id ?? ""} />
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cheese-500">
          {isEditing ? "Edit Area" : "New Area"}
        </p>
        <h4 className="mt-3 text-xl font-semibold text-ink-950">
          {isEditing ? area?.areaName : "Add a delivery area"}
        </h4>
      </div>
      <AdminFormMessage state={state} />
      <AdminField label="Delivery zone" error={state.fieldErrors.zoneId}>
        <AdminSelect
          name="zoneId"
          defaultValue={area?.zoneId ?? initialZoneId ?? zones[0]?.value ?? ""}
        >
          {zones.map((zone) => (
            <option key={zone.value} value={zone.value}>
              {zone.label}
            </option>
          ))}
        </AdminSelect>
      </AdminField>
      <AdminField label="Area name" error={state.fieldErrors.areaName}>
        <AdminInput name="areaName" defaultValue={area?.areaName ?? ""} placeholder="Phase 1" />
      </AdminField>
      <AdminField label="Delivery charge" error={state.fieldErrors.deliveryCharge}>
        <AdminInput
          type="number"
          step="0.01"
          min="0"
          name="deliveryCharge"
          defaultValue={area?.deliveryCharge ?? 0}
        />
      </AdminField>
      <AdminField label="Description">
        <AdminTextarea
          name="description"
          defaultValue={area?.description ?? ""}
          placeholder="Short route or coverage note."
          className="min-h-24"
        />
      </AdminField>
      <SubmitButton
        idleLabel={isEditing ? "Save Area" : "Create Area"}
        pendingLabel={isEditing ? "Saving..." : "Creating..."}
      />
    </form>
  );
}
