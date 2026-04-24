"use client";

import { useReducer } from "react";
import { buildCheckoutPricing } from "@/lib/checkout";
import type {
  CartLine,
  CheckoutAction,
  CheckoutDraft,
  CheckoutFormValues,
  CheckoutPhase,
  DeliveryZone,
} from "@/types/commerce";

interface UseCheckoutStateOptions {
  items: CartLine[];
  zones: DeliveryZone[];
  initialValues?: Partial<CheckoutFormValues>;
}

function getDefaultDeliveryZoneArea(zone?: DeliveryZone | null) {
  return zone?.areas.find((area) => area.isActive) ?? null;
}

function createInitialDraft(
  zones: DeliveryZone[],
  initialValues?: Partial<CheckoutFormValues>,
): CheckoutDraft {
  const defaultZone =
    zones.find((zone) => zone.id === initialValues?.deliveryZoneId) ??
    zones[0] ??
    null;
  const defaultZoneId = defaultZone?.id ?? "";
  const defaultAreaId =
    initialValues?.deliveryZoneAreaId ??
    getDefaultDeliveryZoneArea(defaultZone)?.id ??
    "";

  return {
    phase: "editing",
    form: {
      customerName: initialValues?.customerName ?? "",
      phone: initialValues?.phone ?? "",
      address: initialValues?.address ?? "",
      note: initialValues?.note ?? "",
      deliveryZoneId: defaultZoneId,
      deliveryZoneAreaId: defaultAreaId,
    },
  };
}

function checkoutReducer(
  state: CheckoutDraft,
  action: CheckoutAction,
): CheckoutDraft {
  switch (action.type) {
    case "updateField":
      return {
        ...state,
        phase: state.phase === "submitted" ? "editing" : state.phase,
        form: {
          ...state.form,
          [action.field]: action.value,
        },
      };
    case "selectZone":
      return {
        ...state,
        phase: state.phase === "submitted" ? "editing" : state.phase,
        form: {
          ...state.form,
          deliveryZoneId: action.deliveryZoneId,
          deliveryZoneAreaId: action.deliveryZoneAreaId,
        },
      };
    case "selectArea":
      return {
        ...state,
        phase: state.phase === "submitted" ? "editing" : state.phase,
        form: {
          ...state.form,
          deliveryZoneAreaId: action.deliveryZoneAreaId,
        },
      };
    case "setPhase":
      return {
        ...state,
        phase: action.phase,
      };
    case "reset":
      return {
        phase: "editing",
        form: {
          customerName: "",
          phone: "",
          address: "",
          note: "",
          deliveryZoneId: action.deliveryZoneId ?? "",
          deliveryZoneAreaId: action.deliveryZoneAreaId ?? "",
        },
      };
    default:
      return state;
  }
}

export function useCheckoutState({
  items,
  zones,
  initialValues,
}: UseCheckoutStateOptions) {
  const activeZones = zones.filter((zone) => zone.isActive);
  const [draft, dispatch] = useReducer(
    checkoutReducer,
    createInitialDraft(activeZones, initialValues),
  );

  const selectedZone =
    activeZones.find((zone) => zone.id === draft.form.deliveryZoneId) ??
    activeZones[0] ??
    null;
  const selectedArea =
    selectedZone?.areas.find(
      (area) =>
        area.isActive && area.id === draft.form.deliveryZoneAreaId,
    ) ??
    getDefaultDeliveryZoneArea(selectedZone);
  const pricing = buildCheckoutPricing(items, selectedZone, selectedArea);

  const canSubmit = Boolean(
    items.length > 0 &&
      selectedZone &&
      selectedArea &&
      draft.form.customerName.trim() &&
      draft.form.phone.trim() &&
      draft.form.address.trim(),
  );

  function updateField(
    field: Exclude<
      keyof CheckoutFormValues,
      "deliveryZoneId" | "deliveryZoneAreaId"
    >,
    value: string,
  ) {
    dispatch({ type: "updateField", field, value });
  }

  function selectZone(deliveryZoneId: string) {
    const nextZone =
      activeZones.find((zone) => zone.id === deliveryZoneId) ?? activeZones[0] ?? null;
    const nextAreaId = getDefaultDeliveryZoneArea(nextZone)?.id ?? "";

    dispatch({
      type: "selectZone",
      deliveryZoneId: nextZone?.id ?? "",
      deliveryZoneAreaId: nextAreaId,
    });
  }

  function selectArea(deliveryZoneAreaId: string) {
    dispatch({
      type: "selectArea",
      deliveryZoneAreaId,
    });
  }

  function setPhase(phase: CheckoutPhase) {
    dispatch({ type: "setPhase", phase });
  }

  function reset() {
    const defaultZone = activeZones[0] ?? null;
    dispatch({
      type: "reset",
      deliveryZoneId: defaultZone?.id ?? "",
      deliveryZoneAreaId: getDefaultDeliveryZoneArea(defaultZone)?.id ?? "",
    });
  }

  return {
    phase: draft.phase,
    form: draft.form,
    zones: activeZones,
    selectedZone,
    selectedArea,
    pricing,
    canSubmit,
    updateField,
    selectZone,
    selectArea,
    setPhase,
    reset,
  };
}
