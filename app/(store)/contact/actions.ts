"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/types/supabase";

export interface ContactInquiryActionState {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Partial<
    Record<"customerName" | "phone" | "email" | "subject" | "message", string>
  >;
}

export const initialContactInquiryState: ContactInquiryActionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function submitContactInquiryAction(
  _previousState: ContactInquiryActionState,
  formData: FormData,
): Promise<ContactInquiryActionState> {
  const customerName = getString(formData, "customerName");
  const phone = getString(formData, "phone");
  const email = getString(formData, "email");
  const subject = getString(formData, "subject");
  const message = getString(formData, "message");
  const fieldErrors: ContactInquiryActionState["fieldErrors"] = {};

  if (!customerName) {
    fieldErrors.customerName = "Please share your name.";
  }

  if (!phone && !email) {
    fieldErrors.phone = "Share a phone number or email.";
    fieldErrors.email = "Share an email address or phone number.";
  }

  if (email && !isValidEmail(email)) {
    fieldErrors.email = "Please enter a valid email address.";
  }

  if (!message) {
    fieldErrors.message = "Tell us how we can help.";
  } else if (message.length < 12) {
    fieldErrors.message = "Please add a little more detail.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted contact fields.",
      fieldErrors,
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message:
        "Supabase is not configured yet, so inquiries cannot be saved right now.",
      fieldErrors: {},
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const payload: TablesInsert<"contact_inquiries"> = {
      customer_name: customerName,
      phone: phone || null,
      email: email || null,
      subject: subject || null,
      message,
      status: "new",
    };

    const { error } = await supabase.from("contact_inquiries").insert(payload);

    if (error) {
      return {
        status: "error",
        message:
          error.message ||
          "We could not save your inquiry. Please try again in a moment.",
        fieldErrors: {},
      };
    }

    return {
      status: "success",
      message:
        "Your inquiry has been saved. The store team can now follow up using your preferred contact details.",
      fieldErrors: {},
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unexpected error while saving your inquiry.",
      fieldErrors: {},
    };
  }
}
