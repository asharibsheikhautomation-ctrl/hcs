import { updateOrderStatusAction } from "@/app/admin/actions";
import { AdminSelect } from "@/components/admin/form-primitives";
import { SubmitButton } from "@/components/admin/submit-button";
import { ORDER_STATUSES } from "@/lib/orders";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/commerce";

interface OrderStatusFormProps {
  orderId: string;
  status: OrderStatus;
  className?: string;
  compact?: boolean;
}

export function OrderStatusForm({
  orderId,
  status,
  className,
  compact = false,
}: OrderStatusFormProps) {
  return (
    <form
      action={updateOrderStatusAction}
      className={cn(
        "grid gap-3",
        compact ? "sm:grid-cols-[minmax(0,1fr)_auto]" : undefined,
        className,
      )}
    >
      <input type="hidden" name="id" value={orderId} />
      <AdminSelect
        name="status"
        defaultValue={status}
        className={compact ? "min-w-[12rem]" : undefined}
      >
        {ORDER_STATUSES.map((statusOption) => (
          <option key={statusOption} value={statusOption}>
            {statusOption}
          </option>
        ))}
      </AdminSelect>
      <SubmitButton
        idleLabel="Update Status"
        pendingLabel="Updating..."
        className={compact ? "sm:w-auto" : "w-full"}
      />
    </form>
  );
}
