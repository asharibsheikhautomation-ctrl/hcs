"use server";

import { revalidatePath } from "next/cache";
import { buildCheckoutPricing, createOrderItemInsertRecord } from "@/lib/checkout";
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
import type { TablesInsert } from "@/types/supabase";

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
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

    const pricing = buildCheckoutPricing(
      input.items,
      selectedZone,
      selectedArea,
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
      deliveryCharge: pricing.deliveryCharge,
      subtotal: pricing.subtotal,
      total: pricing.total,
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
      delivery_charge: pricing.deliveryCharge,
      subtotal: pricing.subtotal,
      total: pricing.total,
      status: "New",
      whatsapp_sent: true,
      whatsapp_message: whatsappMessage,
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
          server: orderError?.message ?? "Failed to create the order record.",
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

    revalidatePath("/admin");
    revalidatePath("/admin/orders");

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
