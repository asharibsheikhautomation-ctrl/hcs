"use client";

import { useActionState } from "react";
import { loginAdminAction } from "@/app/admin/actions";
import { AdminField, AdminFormMessage, AdminInput } from "@/components/admin/form-primitives";
import { SubmitButton } from "@/components/admin/submit-button";
import { initialAdminActionState } from "@/types/admin";

export function AdminLoginForm({ nextPath }: { nextPath: string }) {
  const [state, action] = useActionState(loginAdminAction, initialAdminActionState);

  return (
    <form action={action} className="grid gap-5">
      <input type="hidden" name="next" value={nextPath} />
      <AdminFormMessage state={state} />
      <AdminField label="Admin username" error={state.fieldErrors.username}>
        <AdminInput name="username" placeholder="admin" autoComplete="username" />
      </AdminField>
      <AdminField label="Password" error={state.fieldErrors.password}>
        <AdminInput
          type="password"
          name="password"
          placeholder="Enter your admin password"
          autoComplete="current-password"
        />
      </AdminField>
      <SubmitButton idleLabel="Unlock Admin" pendingLabel="Checking..." />
    </form>
  );
}
