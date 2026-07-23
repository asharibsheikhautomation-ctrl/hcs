import type { Voucher, VoucherDiscountType } from "@/types/commerce";
import type { Tables } from "@/types/supabase";

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function normalizeVoucherCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function mapVoucherRow(row: Tables<"vouchers">): Voucher {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    discountType:
      row.discount_type === "fixed" ? "fixed" : "percentage",
    discountValue: Number(row.discount_value ?? 0),
    validFrom: row.valid_from,
    validUntil: row.valid_until,
    maxUses: row.max_uses,
    timesUsed: row.times_used,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function calculateVoucherDiscount(
  subtotal: number,
  voucher?: Pick<Voucher, "discountType" | "discountValue"> | null,
) {
  const safeSubtotal = Math.max(subtotal, 0);

  if (!voucher || safeSubtotal <= 0 || voucher.discountValue <= 0) {
    return 0;
  }

  if (voucher.discountType === "percentage") {
    return roundCurrency(
      Math.min(safeSubtotal, (safeSubtotal * voucher.discountValue) / 100),
    );
  }

  return roundCurrency(Math.min(safeSubtotal, voucher.discountValue));
}

export function validateVoucherForSubtotal(
  voucher: Voucher,
  subtotal: number,
  now = new Date(),
) {
  if (!voucher.isActive) {
    return {
      isValid: false,
      message: "This voucher is not active right now.",
    };
  }

  if (voucher.validFrom && new Date(voucher.validFrom) > now) {
    return {
      isValid: false,
      message: "This voucher is not active yet.",
    };
  }

  if (voucher.validUntil && new Date(voucher.validUntil) < now) {
    return {
      isValid: false,
      message: "This voucher has expired.",
    };
  }

  if (voucher.maxUses !== null && voucher.maxUses <= voucher.timesUsed) {
    return {
      isValid: false,
      message: "This voucher has reached its usage limit.",
    };
  }

  if (voucher.discountValue <= 0) {
    return {
      isValid: false,
      message: "This voucher does not have a valid discount amount.",
    };
  }

  if (voucher.discountType === "percentage" && voucher.discountValue > 100) {
    return {
      isValid: false,
      message: "This voucher has an invalid percentage discount.",
    };
  }

  if (subtotal <= 0) {
    return {
      isValid: false,
      message: "Add products to your cart before using a voucher.",
    };
  }

  return {
    isValid: true,
    message: `${voucher.code} applied successfully.`,
  };
}

export function formatVoucherDiscountLabel(
  discountType: VoucherDiscountType,
  discountValue: number,
) {
  if (discountType === "percentage") {
    return `${discountValue}% off`;
  }

  return `PKR ${discountValue.toLocaleString("en-PK")} off`;
}
