// Admin client with service role key — bypasses RLS.
// Use only in trusted server-side code (coach dashboard routes after password check).
import { createClient as createAdminClient } from "@supabase/supabase-js";

export function createServiceClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
