"use client";

import { useActionState } from "react";
import { saveSiteSettingsAction } from "@/app/admin/actions";
import {
  AdminField,
  AdminFormMessage,
  AdminInput,
  AdminTextarea,
} from "@/components/admin/form-primitives";
import { SubmitButton } from "@/components/admin/submit-button";
import type { AdminSiteSettings } from "@/types/admin";
import { initialAdminActionState } from "@/types/admin";

export function SiteSettingsForm({
  settings,
}: {
  settings: AdminSiteSettings;
}) {
  const [state, action] = useActionState(
    saveSiteSettingsAction,
    initialAdminActionState,
  );

  return (
    <form action={action} className="grid gap-6 rounded-[1.75rem] border border-black/6 bg-white/80 p-6">
      <AdminFormMessage state={state} />

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Site name" error={state.fieldErrors.siteName}>
          <AdminInput name="siteName" defaultValue={settings.siteName} />
        </AdminField>
        <AdminField label="Tagline" error={state.fieldErrors.tagline}>
          <AdminInput name="tagline" defaultValue={settings.tagline} />
        </AdminField>
        <AdminField label="Logo URL">
          <AdminInput name="logoUrl" defaultValue={settings.logoUrl} placeholder="https://..." />
        </AdminField>
        <AdminField label="WhatsApp number" error={state.fieldErrors.whatsappNumber}>
          <AdminInput name="whatsappNumber" defaultValue={settings.whatsappNumber} />
        </AdminField>
        <AdminField label="Announcement bar">
          <AdminInput name="announcementBar" defaultValue={settings.announcementBar} />
        </AdminField>
        <AdminField label="Contact phone">
          <AdminInput name="contactPhone" defaultValue={settings.contactPhone} />
        </AdminField>
        <AdminField label="Contact email">
          <AdminInput name="contactEmail" defaultValue={settings.contactEmail} />
        </AdminField>
        <AdminField label="Business hours">
          <AdminInput name="businessHours" defaultValue={settings.businessHours} />
        </AdminField>
      </div>

      <AdminField label="Address">
        <AdminTextarea name="address" defaultValue={settings.address} className="min-h-24" />
      </AdminField>

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Hero kicker">
          <AdminInput name="heroKicker" defaultValue={settings.heroKicker} />
        </AdminField>
        <AdminField label="Hero title" error={state.fieldErrors.heroTitle}>
          <AdminInput name="heroTitle" defaultValue={settings.heroTitle} />
        </AdminField>
      </div>

      <AdminField label="Hero subtitle" error={state.fieldErrors.heroSubtitle}>
        <AdminTextarea
          name="heroSubtitle"
          defaultValue={settings.heroSubtitle}
          className="min-h-24"
        />
      </AdminField>

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Homepage story title">
          <AdminInput
            name="homepageStoryTitle"
            defaultValue={settings.homepageStoryTitle}
          />
        </AdminField>
        <AdminField label="Products section title">
          <AdminInput
            name="productsSectionTitle"
            defaultValue={settings.productsSectionTitle}
          />
        </AdminField>
        <AdminField label="Deals section title">
          <AdminInput
            name="dealsSectionTitle"
            defaultValue={settings.dealsSectionTitle}
          />
        </AdminField>
        <AdminField label="Contact section title">
          <AdminInput
            name="contactSectionTitle"
            defaultValue={settings.contactSectionTitle}
          />
        </AdminField>
      </div>

      <AdminField label="Homepage story body">
        <AdminTextarea
          name="homepageStoryBody"
          defaultValue={settings.homepageStoryBody}
        />
      </AdminField>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminField label="Primary color" error={state.fieldErrors.primaryColor}>
          <AdminInput name="primaryColor" defaultValue={settings.primaryColor} />
        </AdminField>
        <AdminField label="Secondary color" error={state.fieldErrors.secondaryColor}>
          <AdminInput name="secondaryColor" defaultValue={settings.secondaryColor} />
        </AdminField>
        <AdminField label="Background color" error={state.fieldErrors.backgroundColor}>
          <AdminInput name="backgroundColor" defaultValue={settings.backgroundColor} />
        </AdminField>
        <AdminField label="Surface color" error={state.fieldErrors.surfaceColor}>
          <AdminInput name="surfaceColor" defaultValue={settings.surfaceColor} />
        </AdminField>
      </div>

      <SubmitButton idleLabel="Save Settings" pendingLabel="Saving settings..." />
    </form>
  );
}
