import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service role key (bypasses RLS).
 * Returns null when the project isn't connected yet — callers must handle
 * that by rendering a "not connected" state instead of crashing.
 */
export function getServerSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const SINGLETON_COMPANY_ID = "00000000-0000-0000-0000-000000000001";
