import { ORDER_STATUSES } from "@/lib/orders";
import type { AdminOrderFilters, AdminOrderSort } from "@/types/admin";
import type { OrderStatus } from "@/types/commerce";

type SearchParamValue = string | string[] | undefined;

export const ADMIN_ORDER_SORT_OPTIONS: Array<{
  value: AdminOrderSort;
  label: string;
}> = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

function getSearchParamValue(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUSES.includes(value as OrderStatus);
}

export function isAdminOrderSort(value: string): value is AdminOrderSort {
  return value === "newest" || value === "oldest";
}

export function parseAdminOrderFilters(searchParams: {
  query?: SearchParamValue;
  status?: SearchParamValue;
  sort?: SearchParamValue;
}): AdminOrderFilters {
  const query = getSearchParamValue(searchParams.query).trim();
  const statusCandidate = getSearchParamValue(searchParams.status).trim();
  const sortCandidate = getSearchParamValue(searchParams.sort).trim();

  return {
    query,
    status: isOrderStatus(statusCandidate) ? statusCandidate : "all",
    sort: isAdminOrderSort(sortCandidate) ? sortCandidate : "newest",
  };
}

export function sanitizeAdminOrderSearchTerm(value: string) {
  return value
    .replace(/[%(),'"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatAdminOrderDate(value: string) {
  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getOrderStatusBadgeClasses(status: OrderStatus) {
  switch (status) {
    case "New":
      return "border-cheese-300 bg-cheese-100/80 text-cheese-800";
    case "Contacted":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "Confirmed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Preparing":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Out for Delivery":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "Delivered":
      return "border-green-200 bg-green-50 text-green-700";
    case "Cancelled":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-black/10 bg-white text-ink-700";
  }
}

export function buildAdminOrdersHref(filters: Partial<AdminOrderFilters> = {}) {
  const params = new URLSearchParams();

  if (filters.query?.trim()) {
    params.set("query", filters.query.trim());
  }

  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }

  if (filters.sort && filters.sort !== "newest") {
    params.set("sort", filters.sort);
  }

  const search = params.toString();

  return search ? `/admin/orders?${search}` : "/admin/orders";
}

export function buildAdminOrderDetailHref(
  orderId: string,
  filters?: Partial<AdminOrderFilters>,
) {
  const returnTo = buildAdminOrdersHref(filters);
  const params = new URLSearchParams();

  if (returnTo !== "/admin/orders") {
    params.set("returnTo", returnTo);
  }

  const search = params.toString();

  return search
    ? `/admin/orders/${orderId}?${search}`
    : `/admin/orders/${orderId}`;
}

export function getAdminOrderReturnPath(value?: string) {
  if (!value) {
    return "/admin/orders";
  }

  return value.startsWith("/admin/orders") ? value : "/admin/orders";
}
