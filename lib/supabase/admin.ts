import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL for Supabase admin uploads.",
    );
  }

  if (!supabaseServiceRoleKey) {
    throw new Error(
      "Add SUPABASE_SERVICE_ROLE_KEY in .env.local to enable admin image uploads.",
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
