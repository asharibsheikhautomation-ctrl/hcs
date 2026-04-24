import type { CartLine, CheckoutFormValues, OrderStatus } from "@/types/commerce";

export const ORDER_STATUSES: OrderStatus[] = [
  "New",
  "Contacted",
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

export type CheckoutValidationErrors = Partial<
  Record<keyof CheckoutFormValues | "items" | "server", string>
>;

export interface CheckoutSubmissionInput {
  form: CheckoutFormValues;
  items: CartLine[];
  whatsappNumber: string;
}

export type CheckoutSubmissionResult =
  | {
      success: true;
      message: string;
      orderId: string;
      orderNumber: string;
      whatsappMessage: string;
      whatsappUrl: string;
    }
  | {
      success: false;
      message: string;
      errors: CheckoutValidationErrors;
    };

export function normalizePhoneNumber(value: string) {
  return value.replace(/\D/g, "");
}

export function validateCheckoutSubmission(input: CheckoutSubmissionInput) {
  const errors: CheckoutValidationErrors = {};
  const normalizedPhone = normalizePhoneNumber(input.form.phone);

  if (!input.form.customerName.trim()) {
    errors.customerName = "Customer name is required.";
  }

  if (!normalizedPhone || normalizedPhone.length < 10) {
    errors.phone = "A valid phone number is required.";
  }

  if (!input.form.address.trim()) {
    errors.address = "Delivery address is required.";
  }

  if (!input.form.deliveryZoneId.trim()) {
    errors.deliveryZoneId = "Please select a delivery zone.";
  }

  if (!input.form.deliveryZoneAreaId.trim()) {
    errors.deliveryZoneAreaId = "Please select a delivery area.";
  }

  if (
    input.items.length === 0 ||
    input.items.some(
      (item) =>
        !item.productName.trim() ||
        item.quantity <= 0 ||
        item.unitPrice < 0,
    )
  ) {
    errors.items = "Your cart is empty or contains invalid items.";
  }

  if (!input.whatsappNumber.trim()) {
    errors.server = "A WhatsApp number is not configured yet.";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    normalizedPhone,
  };
}

export function generateOrderNumber() {
  return `HCS-${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}
