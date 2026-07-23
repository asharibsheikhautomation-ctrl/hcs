import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapVoucherRow, normalizeVoucherCode } from "@/lib/vouchers";
import type { Database } from "@/types/supabase";

export async function fetchVoucherByCode(
  code: string,
  client?: SupabaseClient<Database>,
) {
  const normalizedCode = normalizeVoucherCode(code);

  if (!normalizedCode) {
    return null;
  }

  const supabase = client ?? (await createSupabaseServerClient());
  const { data, error } = await supabase
    .from("vouchers")
    .select("*")
    .eq("code", normalizedCode)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapVoucherRow(data);
}
