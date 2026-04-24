import { getOrderStatusBadgeClasses } from "@/lib/admin-orders";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/commerce";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({
  status,
  className,
}: OrderStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em]",
        getOrderStatusBadgeClasses(status),
        className,
      )}
    >
      {status}
    </span>
  );
}
