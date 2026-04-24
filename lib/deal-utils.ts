import { formatCurrency } from "@/lib/utils";
import type { DealDiscountType, DealStatus } from "@/types/commerce";

interface DealStatusInput {
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}

interface DealPricingInput {
  discountType: DealDiscountType;
  discountValue: number;
}

interface DealTimingInput {
  startsAt?: string | null;
  endsAt?: string | null;
}

export function resolveDealStatus({
  isActive,
  startsAt,
  endsAt,
}: DealStatusInput): DealStatus {
  const now = new Date();
  const startTime = startsAt ? new Date(startsAt).valueOf() : null;
  const endTime = endsAt ? new Date(endsAt).valueOf() : null;

  if (!isActive) {
    return "archived";
  }

  if (startTime && startTime > now.valueOf()) {
    return "scheduled";
  }

  if (endTime && endTime < now.valueOf()) {
    return "archived";
  }

  return "active";
}

export function calculateDealPrice(
  originalTotal: number,
  discountType: DealDiscountType,
  discountValue: number,
) {
  if (discountType === "percentage") {
    return Math.max(
      Math.round(originalTotal - originalTotal * (discountValue / 100)),
      0,
    );
  }

  return Math.max(Math.round(originalTotal - discountValue), 0);
}

export function buildDealSavingsLabel(
  discountType: DealDiscountType,
  discountValue: number,
  fallback?: string | null,
) {
  if (fallback?.trim()) {
    return fallback.trim();
  }

  if (discountType === "fixed") {
    return `Save PKR ${discountValue.toLocaleString("en-PK")}`;
  }

  if (discountType === "bundle") {
    return discountValue > 0
      ? `Bundle Save PKR ${discountValue.toLocaleString("en-PK")}`
      : "Bundle Offer";
  }

  return `Save ${discountValue}%`;
}

export function formatDealDiscount({
  discountType,
  discountValue,
}: DealPricingInput) {
  if (discountType === "fixed") {
    return `PKR ${discountValue.toLocaleString("en-PK")} off`;
  }

  if (discountType === "bundle") {
    return discountValue > 0
      ? `Bundle save ${formatCurrency(discountValue)}`
      : "Bundle offer";
  }

  return `${discountValue}% off`;
}

export function formatDealValidity({ startsAt, endsAt }: DealTimingInput) {
  const formatter = new Intl.DateTimeFormat("en-PK", {
    month: "short",
    day: "numeric",
  });

  if (startsAt && endsAt) {
    return `${formatter.format(new Date(startsAt))} - ${formatter.format(new Date(endsAt))}`;
  }

  if (endsAt) {
    return `Ends ${formatter.format(new Date(endsAt))}`;
  }

  if (startsAt) {
    return `Starts ${formatter.format(new Date(startsAt))}`;
  }

  return "Limited-time offer";
}

export function formatDealLifecycle(status: DealStatus) {
  if (status === "scheduled") {
    return "Scheduled";
  }

  if (status === "archived") {
    return "Expired";
  }

  return "Active";
}
