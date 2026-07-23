"use server";

import { revalidatePath } from "next/cache";
import {
  buildCheckoutPricing,
  calculateSubtotal,
  createOrderItemInsertRecord,
} from "@/lib/checkout";
import { fetchActiveDeliveryZones } from "@/lib/delivery-zones";
import {
  CheckoutSubmissionInput,
  type CheckoutSubmissionResult,
  generateOrderNumber,
  validateCheckoutSubmission,
} from "@/lib/orders";
import { fetchSiteSettings } from "@/lib/site-settings";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createWhatsAppOrderUrl,
  formatWhatsAppOrderMessage,
} from "@/lib/whatsapp";
import { fetchVoucherByCode } from "@/lib/vouchers-server";
import {
  calculateVoucherDiscount,
  normalizeVoucherCode,
  validateVoucherForSubtotal,
} from "@/lib/vouchers";
import type { TablesInsert } from "@/types/supabase";
import type { CartLine } from "@/types/commerce";

interface ApplyVoucherInput {
  code: string;
  items: CartLine[];
}

type ApplyVoucherResult =
  | {
      success: true;
      message: string;
      voucher: NonNullable<Awaited<ReturnType<typeof fetchVoucherByCode>>>;
      discountAmount: number;
    }
  | {
      success: false;
      message: string;
      error: string;
    };

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function getVoucherSystemMessage(error: unknown) {
  if (error instanceof Error) {
    if (
      error.message.includes("vouchers") ||
      error.message.includes("voucher_id") ||
      error.message.includes("voucher_code") ||
      error.message.includes("discount_amount")
    ) {
      return "Voucher system is not ready in Supabase yet. Run the SQL in supabase/voucher-system.sql first.";
    }

    return error.message;
  }

  return "Voucher system is not available right now.";
}

async function resolveAppliedVoucher(code: string, items: CartLine[]) {
  const normalizedCode = normalizeVoucherCode(code);

  if (!normalizedCode) {
    return {
      voucher: null,
      error: "Enter a voucher code first.",
      discountAmount: 0,
    };
  }

  const subtotal = calculateSubtotal(items);
  const voucher = await fetchVoucherByCode(normalizedCode);

  if (!voucher) {
    return {
      voucher: null,
      error: "This voucher code was not found.",
      discountAmount: 0,
    };
  }

  const validation = validateVoucherForSubtotal(voucher, subtotal);

  if (!validation.isValid) {
    return {
      voucher: null,
      error: validation.message,
      discountAmount: 0,
    };
  }

  return {
    voucher,
    error: null,
    discountAmount: calculateVoucherDiscount(subtotal, voucher),
  };
}

export async function applyCheckoutVoucherAction(
  input: ApplyVoucherInput,
): Promise<ApplyVoucherResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: "Live vouchers are not available yet.",
      error:
        "Supabase environment variables are missing for voucher validation.",
    };
  }

  try {
    const resolvedVoucher = await resolveAppliedVoucher(input.code, input.items);

    if (!resolvedVoucher.voucher) {
      return {
        success: false,
        message: "This voucher could not be applied.",
        error: resolvedVoucher.error ?? "Invalid voucher.",
      };
    }

    return {
      success: true,
      message: `${resolvedVoucher.voucher.code} applied successfully.`,
      voucher: resolvedVoucher.voucher,
      discountAmount: resolvedVoucher.discountAmount,
    };
  } catch (error) {
    return {
      success: false,
      message: "Voucher validation failed.",
      error: getVoucherSystemMessage(error),
    };
  }
}

export async function submitCheckoutOrder(
  input: CheckoutSubmissionInput,
): Promise<CheckoutSubmissionResult> {
  const validation = validateCheckoutSubmission(input);

  if (!validation.isValid) {
    return {
      success: false,
      message: "Please fix the highlighted checkout fields.",
      errors: validation.errors,
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message:
        "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable live checkout.",
      errors: {
        server:
          "Supabase environment variables are missing for order submission.",
      },
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const [zones, liveSettings] = await Promise.all([
      fetchActiveDeliveryZones(supabase),
      fetchSiteSettings(supabase).catch(() => null),
    ]);

    const selectedZone = zones.find(
      (zone) => zone.id === input.form.deliveryZoneId,
    );

    if (!selectedZone) {
      return {
        success: false,
        message: "The selected delivery zone is no longer available.",
        errors: {
          deliveryZoneId: "Please select an active delivery zone.",
        },
      };
    }

    const selectedArea = selectedZone.areas.find(
      (area) =>
        area.isActive && area.id === input.form.deliveryZoneAreaId,
    );

    if (!selectedArea) {
      return {
        success: false,
        message: "The selected delivery area is no longer available.",
        errors: {
          deliveryZoneAreaId: "Please select an active delivery area.",
        },
      };
    }

    const submittedVoucherCode = input.form.voucherCode.trim();
    let appliedVoucher: NonNullable<Awaited<ReturnType<typeof fetchVoucherByCode>>> | null =
      null;
    let voucherDiscountAmount = 0;

    if (submittedVoucherCode) {
      try {
        const resolvedVoucher = await resolveAppliedVoucher(
          submittedVoucherCode,
          input.items,
        );

        if (!resolvedVoucher.voucher) {
          return {
            success: false,
            message: "The voucher could not be applied to this order.",
            errors: {
              voucherCode:
                resolvedVoucher.error ?? "Please enter a valid voucher code.",
            },
          };
        }

        appliedVoucher = resolvedVoucher.voucher;
        voucherDiscountAmount = resolvedVoucher.discountAmount;
      } catch (error) {
        return {
          success: false,
          message: "The voucher system is not available right now.",
          errors: {
            voucherCode: getVoucherSystemMessage(error),
          },
        };
      }
    }

    const finalPricing = buildCheckoutPricing(
      input.items,
      selectedZone,
      selectedArea,
      appliedVoucher,
    );
    const orderNumber = generateOrderNumber();
    const whatsappNumber =
      liveSettings?.whatsappNumber.trim() || input.whatsappNumber.trim();
    const note = input.form.note.trim();
    const customerName = input.form.customerName.trim();
    const address = input.form.address.trim();
    const deliveryZoneLabel = `${selectedZone.name} / ${selectedArea.name}`;
    const whatsappMessage = formatWhatsAppOrderMessage({
      orderNumber,
      customerName,
      phone: validation.normalizedPhone,
      address,
      note: note || undefined,
      deliveryZoneName: selectedZone.name,
      deliveryZoneAreaName: selectedArea.name,
      voucherCode: appliedVoucher?.code ?? null,
      discountAmount: finalPricing.discountAmount,
      deliveryCharge: finalPricing.deliveryCharge,
      subtotal: finalPricing.subtotal,
      total: finalPricing.total,
      items: input.items,
    });
    const whatsappUrl = createWhatsAppOrderUrl(
      whatsappNumber,
      whatsappMessage,
    );

    const orderInsert: TablesInsert<"orders"> = {
      order_number: orderNumber,
      customer_name: customerName,
      phone: validation.normalizedPhone,
      address,
      note: note || null,
      delivery_zone_id: selectedZone.id,
      delivery_zone_name: deliveryZoneLabel,
      delivery_charge: finalPricing.deliveryCharge,
      subtotal: finalPricing.subtotal,
      total: finalPricing.total,
      status: "New",
      whatsapp_sent: true,
      whatsapp_message: whatsappMessage,
      ...(appliedVoucher
        ? {
            voucher_id: appliedVoucher.id,
            voucher_code: appliedVoucher.code,
            discount_amount: voucherDiscountAmount,
          }
        : {}),
    };

    const { data: insertedOrder, error: orderError } = await supabase
      .from("orders")
      .insert(orderInsert)
      .select("id, order_number")
      .single();

    if (orderError || !insertedOrder) {
      return {
        success: false,
        message: "We couldn't save the order. Please try again.",
        errors: {
          ...(appliedVoucher
            ? {
                voucherCode: getVoucherSystemMessage(orderError),
              }
            : {}),
          server:
            orderError?.message ??
            "Failed to create the order record.",
        },
      };
    }

    const orderItems = input.items.map((item) =>
      createOrderItemInsertRecord(insertedOrder.id, item),
    );

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (orderItemsError) {
      await supabase.from("orders").delete().eq("id", insertedOrder.id);

      return {
        success: false,
        message: "We couldn't save the order items. Please try again.",
        errors: {
          server:
            orderItemsError.message ??
            "Failed to create the order item records.",
        },
      };
    }

    if (appliedVoucher) {
      const { error: voucherUsageError } = await supabase
        .from("vouchers")
        .update({
          times_used: appliedVoucher.timesUsed + 1,
        })
        .eq("id", appliedVoucher.id);

      if (voucherUsageError) {
        await supabase.from("orders").delete().eq("id", insertedOrder.id);

        return {
          success: false,
          message: "We couldn't finalize the voucher usage. Please try again.",
          errors: {
            voucherCode: getVoucherSystemMessage(voucherUsageError),
          },
        };
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/checkout");

    return {
      success: true,
      message: `Order ${insertedOrder.order_number} was saved and is ready for WhatsApp.`,
      orderId: insertedOrder.id,
      orderNumber: insertedOrder.order_number,
      whatsappMessage,
      whatsappUrl,
    };
  } catch (error) {
    console.error("Checkout order submission failed.", error);

    return {
      success: false,
      message: "Something went wrong while creating the order.",
      errors: {
        server:
          error instanceof Error
            ? error.message
            : "Unexpected checkout submission error.",
      },
    };
  }
}
