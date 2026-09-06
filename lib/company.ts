import "server-only";
import { cookies } from "next/headers";
import { getServerSupabaseClient, SINGLETON_COMPANY_ID } from "@/lib/supabase/server";
import { DEMO_COMPANY } from "@/lib/demo-data";
import type { Company } from "@/lib/types";

const DEFAULT_COMPANY: Company = {
  id: SINGLETON_COMPANY_ID,
  name: "Mon entreprise",
  base_currency: "CAD",
  sharia_mode: false,
};

export const SHARIA_COOKIE = "sharia_mode";

export async function getCompany(): Promise<{ company: Company; connected: boolean }> {
  const supabase = getServerSupabaseClient();

  if (!supabase) {
    // Without a database the Sharia preference still has to be togglable,
    // otherwise the whole feature is unreachable in demo mode. A cookie is
    // enough for a single-user preference.
    const store = await cookies();
    const shariaMode = store.get(SHARIA_COOKIE)?.value === "true";
    return { company: { ...DEMO_COMPANY, sharia_mode: shariaMode }, connected: false };
  }

  const { data } = await supabase.from("company").select("*").eq("id", SINGLETON_COMPANY_ID).maybeSingle();
  if (!data) return { company: DEFAULT_COMPANY, connected: true };

  return { company: data as Company, connected: true };
}
