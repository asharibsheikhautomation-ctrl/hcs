"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { submitCheckoutOrder } from "@/app/(store)/checkout/actions";
import { FadeUp, ScaleIn, SectionTransition } from "@/components/motion";
import { useCart } from "@/components/providers/cart-provider";
import { StoreStatePanel } from "@/components/store/store-state-panel";
import { useCheckoutState } from "@/hooks/use-checkout-state";
import type { DeliveryZone, SiteSettings } from "@/types/commerce";
import type { CheckoutValidationErrors } from "@/lib/orders";
import { createWhatsAppOrderMessage } from "@/lib/whatsapp";
import { formatCurrency } from "@/lib/utils";

interface CheckoutScaffoldProps {
  zones: DeliveryZone[];
  settings: SiteSettings;
}

function clearFieldError(
  errors: CheckoutValidationErrors,
  field: keyof CheckoutValidationErrors,
) {
  if (!errors[field]) {
    return errors;
  }

  const nextErrors = { ...errors };
  delete nextErrors[field];
  return nextErrors;
}

export function CheckoutScaffold({
  zones,
  settings,
}: CheckoutScaffoldProps) {
  const { clear, isHydrated, items } = useCart();
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<CheckoutValidationErrors>({});
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submittedOrderNumber, setSubmittedOrderNumber] = useState<string | null>(
    null,
  );
  const {
    canSubmit,
    form,
    phase,
    pricing,
    selectedZone,
    selectedArea,
    updateField,
    selectZone,
    selectArea,
    setPhase,
  } = useCheckoutState({
    items,
    zones,
  });

  const previewWhatsAppMessage = createWhatsAppOrderMessage({
    customerName: form.customerName,
    phone: form.phone,
    address: form.address,
    note: form.note,
    deliveryZoneName: selectedZone?.name ?? "Not selected",
    deliveryZoneAreaName: selectedArea?.name ?? "Not selected",
    deliveryCharge: pricing.deliveryCharge,
    subtotal: pricing.subtotal,
    total: pricing.total,
    items,
    orderNumber: submittedOrderNumber ?? undefined,
  });

  function handleFieldChange(
    field: "customerName" | "phone" | "address" | "note",
    value: string,
  ) {
    updateField(field, value);
    setSubmitMessage(null);
    setFieldErrors((currentErrors) => {
      const withoutField = clearFieldError(currentErrors, field);
      return clearFieldError(withoutField, "server");
    });
  }

  function handleZoneChange(value: string) {
    selectZone(value);
    setSubmitMessage(null);
    setFieldErrors((currentErrors) => {
      const withoutZone = clearFieldError(currentErrors, "deliveryZoneId");
      const withoutArea = clearFieldError(withoutZone, "deliveryZoneAreaId");
      return clearFieldError(withoutArea, "server");
    });
  }

  function handleAreaChange(value: string) {
    selectArea(value);
    setSubmitMessage(null);
    setFieldErrors((currentErrors) => {
      const withoutArea = clearFieldError(currentErrors, "deliveryZoneAreaId");
      return clearFieldError(withoutArea, "server");
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitMessage(null);
    setFieldErrors({});

    const popup =
      typeof window !== "undefined" ? window.open("about:blank", "_blank") : null;

    if (popup) {
      popup.document.write(
        "<html><body style='font-family:sans-serif;padding:24px'>Preparing your WhatsApp order...</body></html>",
      );
    }

    setPhase("submitting");

    startTransition(async () => {
      const result = await submitCheckoutOrder({
        form,
        items,
        whatsappNumber: settings.whatsappNumber,
      });

      if (!result.success) {
        popup?.close();
        setPhase("editing");
        setFieldErrors(result.errors);
        setSubmitMessage(result.message);
        return;
      }

      setSubmittedOrderNumber(result.orderNumber);
      setSubmitMessage(result.message);
      setPhase("submitted");
      clear();

      if (popup) {
        popup.opener = null;
        popup.location.href = result.whatsappUrl;
        return;
      }

      window.location.assign(result.whatsappUrl);
    });
  }

  if (!isHydrated) {
    return (
      <section className="container-main pb-20">
        <SectionTransition>
          <div className="cheese-surface luxe-panel animate-pulse rounded-[2rem] p-8">
            <div className="h-8 w-48 rounded-full bg-surface-muted" />
            <div className="mt-4 h-5 w-full max-w-2xl rounded-full bg-surface-muted" />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="h-16 rounded-[1.5rem] bg-surface-muted" />
              <div className="h-16 rounded-[1.5rem] bg-surface-muted" />
              <div className="h-28 rounded-[1.5rem] bg-surface-muted md:col-span-2" />
            </div>
          </div>
        </SectionTransition>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="container-main pb-20">
        <SectionTransition>
          <StoreStatePanel
            eyebrow="Cart Empty"
            title="Your cart is empty."
            description="Add products, then return to checkout."
            actions={
              <>
                <Link href="/products" className="btn-base btn-primary">
                  Explore Products
                </Link>
                <Link href="/deals" className="btn-base btn-secondary">
                  View Deals
                </Link>
              </>
            }
          />
        </SectionTransition>
      </section>
    );
  }

  return (
    <section className="container-main pb-20">
      <form
        className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8"
        onSubmit={handleSubmit}
      >
        <SectionTransition>
          <div className="cheese-surface luxe-panel rounded-[2rem] p-5 sm:p-6 md:p-8">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cheese-500">
                Customer Details
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-ink-950 sm:text-4xl">
                Complete the order
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-ink-700/76">
                Save the order, then continue on WhatsApp.
              </p>
              {submitMessage ? (
                <FadeUp delay={0.05}>
                  <div className="mt-4 rounded-[1.4rem] border border-cheese-200/70 bg-cheese-50 px-4 py-3 text-sm text-ink-700">
                    {submitMessage}
                  </div>
                </FadeUp>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-ink-700">
                <span>Customer name</span>
                <input
                  required
                  className="field-input"
                  value={form.customerName}
                  onChange={(event) =>
                    handleFieldChange("customerName", event.target.value)
                  }
                  placeholder="Customer name"
                />
                {fieldErrors.customerName ? (
                  <p className="text-xs font-semibold text-red-600">
                    {fieldErrors.customerName}
                  </p>
                ) : null}
              </label>

              <label className="space-y-2 text-sm font-medium text-ink-700">
                <span>Phone</span>
                <input
                  required
                  className="field-input"
                  value={form.phone}
                  onChange={(event) =>
                    handleFieldChange("phone", event.target.value)
                  }
                  placeholder="03XXXXXXXXX"
                />
                {fieldErrors.phone ? (
                  <p className="text-xs font-semibold text-red-600">
                    {fieldErrors.phone}
                  </p>
                ) : null}
              </label>

              <label className="space-y-2 text-sm font-medium text-ink-700 md:col-span-2">
                <span>Address</span>
                <textarea
                  required
                  className="field-textarea min-h-28 resize-none"
                  value={form.address}
                  onChange={(event) =>
                    handleFieldChange("address", event.target.value)
                  }
                  placeholder="Street, house number, area, landmark"
                />
                {fieldErrors.address ? (
                  <p className="text-xs font-semibold text-red-600">
                    {fieldErrors.address}
                  </p>
                ) : null}
              </label>

              <label className="space-y-2 text-sm font-medium text-ink-700">
                <span>Delivery zone</span>
                <select
                  required
                  className="field-select"
                  value={form.deliveryZoneId}
                  onChange={(event) => handleZoneChange(event.target.value)}
                >
                  {zones
                    .filter((zone) => zone.isActive)
                    .map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                </select>
                {fieldErrors.deliveryZoneId ? (
                  <p className="text-xs font-semibold text-red-600">
                    {fieldErrors.deliveryZoneId}
                  </p>
                ) : null}
              </label>

              <label className="space-y-2 text-sm font-medium text-ink-700">
                <span>Delivery area</span>
                <select
                  required
                  className="field-select"
                  value={form.deliveryZoneAreaId}
                  onChange={(event) => handleAreaChange(event.target.value)}
                  disabled={
                    !selectedZone ||
                    !selectedZone.areas.some((area) => area.isActive)
                  }
                >
                  {selectedZone?.areas.some((area) => area.isActive) ? (
                    selectedZone.areas
                      .filter((area) => area.isActive)
                      .map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.name} - {formatCurrency(area.deliveryCharge)}
                        </option>
                      ))
                  ) : (
                    <option value="">No active areas available</option>
                  )}
                </select>
                {fieldErrors.deliveryZoneAreaId ? (
                  <p className="text-xs font-semibold text-red-600">
                    {fieldErrors.deliveryZoneAreaId}
                  </p>
                ) : null}
                {selectedArea?.description ? (
                  <p className="line-clamp-2 text-xs leading-5 text-ink-700/68">
                    {selectedArea.description}
                  </p>
                ) : null}
              </label>

              <label className="space-y-2 text-sm font-medium text-ink-700">
                <span>Estimated delivery time</span>
                <div className="rounded-2xl border border-cheese-200/70 bg-cheese-50 px-4 py-3 text-sm text-ink-700">
                  {selectedZone?.estimatedDeliveryTime || "Select a zone"}
                </div>
              </label>

              <label className="space-y-2 text-sm font-medium text-ink-700 md:col-span-2">
                <span>Note</span>
                <textarea
                  className="field-textarea min-h-32 resize-none"
                  value={form.note}
                  onChange={(event) => handleFieldChange("note", event.target.value)}
                  placeholder="Anything the store should know?"
                />
              </label>
            </div>
          </div>
        </SectionTransition>

        <div className="space-y-6">
          <SectionTransition delay={0.08}>
            <div className="cheese-surface luxe-panel rounded-[2rem] p-5 sm:p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cheese-500">
                Cart Summary
              </p>
              <div className="mt-5 space-y-4">
                {items.map((item) => (
                  <ScaleIn key={item.id} scale={0.98} amount={0.1}>
                    <div className="flex flex-col gap-4 rounded-2xl border border-cheese-200/70 bg-cheese-50 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-ink-950">{item.productName}</p>
                        <p className="text-sm text-ink-700/70">
                          {item.quantity} x {item.unitLabel ?? "item"}
                        </p>
                        {item.includedItems?.length ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.includedItems.map((includedItem) => (
                              <span
                                key={`${item.id}-${includedItem.id}`}
                                className="rounded-full border border-black/8 bg-white/92 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink-700"
                              >
                                {includedItem.productName} x{includedItem.quantity}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <p className="text-left font-semibold text-ink-950 sm:text-right">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </ScaleIn>
                ))}
              </div>

              {fieldErrors.items ? (
                <p className="mt-4 text-xs font-semibold text-red-600">
                  {fieldErrors.items}
                </p>
              ) : null}

              <div className="mt-6 rounded-[1.6rem] border border-cheese-200/70 bg-cheese-50 px-4 py-4 text-sm text-ink-700">
                {pricing.freeDeliveryMinimum <= 0 ? (
                  <p>Delivery charges apply based on the selected area.</p>
                ) : pricing.qualifiesForFreeDelivery ? (
                  <p className="font-semibold text-cheese-500">
                    Free delivery for {selectedZone?.name}.
                  </p>
                ) : (
                  <p>
                    Spend{" "}
                    <span className="font-semibold text-ink-950">
                      {formatCurrency(pricing.remainingForFreeDelivery)}
                    </span>{" "}
                    more for free delivery.
                  </p>
                )}
              </div>

              <div className="mt-6 space-y-3 border-t border-black/5 pt-5 text-sm text-ink-700">
                <div className="flex items-center justify-between">
                  <span>Selected area</span>
                  <span>{selectedArea?.name ?? "Not selected"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(pricing.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery charge</span>
                  <span>{formatCurrency(pricing.deliveryCharge)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Free delivery threshold</span>
                  <span>
                    {pricing.freeDeliveryMinimum > 0
                      ? formatCurrency(pricing.freeDeliveryMinimum)
                      : "Not available"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-base font-semibold text-ink-950">
                  <span>Final total</span>
                  <span>{formatCurrency(pricing.total)}</span>
                </div>
              </div>

              {fieldErrors.server ? (
                <p className="mt-4 text-xs font-semibold text-red-600">
                  {fieldErrors.server}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={!canSubmit || isPending}
                className="btn-base btn-primary mt-6 w-full"
              >
                {isPending || phase === "submitting"
                  ? "Saving order..."
                  : phase === "submitted"
                    ? "WhatsApp Ready"
                    : "Place Order"}
              </button>
            </div>
          </SectionTransition>

          <FadeUp delay={0.12}>
            <details className="cheese-surface luxe-panel rounded-[2rem] p-5 md:hidden">
              <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-[0.3em] text-cheese-500">
                WhatsApp Preview
              </summary>
              <pre className="mt-4 whitespace-pre-wrap text-xs leading-6 text-ink-700/78">
                {previewWhatsAppMessage}
              </pre>
            </details>
            <div className="cheese-surface luxe-panel hidden rounded-[2rem] p-6 md:block md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cheese-500">
                WhatsApp Preview
              </p>
              <pre className="mt-4 whitespace-pre-wrap text-xs leading-6 text-ink-700/78 md:text-sm">
                {previewWhatsAppMessage}
              </pre>
            </div>
          </FadeUp>
        </div>
      </form>
    </section>
  );
}
