"use client";

import { useActionState } from "react";
import { saveSimpleAdminSettingsAction } from "@/app/admin/actions";
import {
  AdminField,
  AdminFormMessage,
  AdminInput,
} from "@/components/admin/form-primitives";
import { SubmitButton } from "@/components/admin/submit-button";
import { initialAdminActionState } from "@/types/admin";

interface SimpleSettingsFormProps {
  settings: {
    whatsappNumber: string;
    businessHours: string;
  };
}

export function SimpleSettingsForm({ settings }: SimpleSettingsFormProps) {
  const [state, action] = useActionState(
    saveSimpleAdminSettingsAction,
    initialAdminActionState,
  );

  return (
    <form
      action={action}
      className="grid gap-4 rounded-[1.75rem] border border-black/6 bg-white/82 p-5 md:p-6"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cheese-500">
          Store settings
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-ink-950 md:text-3xl">
          Contact details used on the website
        </h3>
      </div>

      <AdminFormMessage state={state} />

      <AdminField
        label="WhatsApp number"
        error={state.fieldErrors.whatsappNumber}
      >
        <AdminInput
          name="whatsappNumber"
          defaultValue={settings.whatsappNumber}
          placeholder="923001234567"
        />
      </AdminField>

      <AdminField
        label="Business hours"
        error={state.fieldErrors.businessHours}
      >
        <AdminInput
          name="businessHours"
          defaultValue={settings.businessHours}
          placeholder="Daily, 11:00 AM to 11:00 PM"
        />
      </AdminField>

      <SubmitButton
        idleLabel="Save Settings"
        pendingLabel="Saving..."
        className="w-full md:w-auto"
      />
    </form>
  );
}
