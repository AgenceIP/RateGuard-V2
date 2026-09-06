"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getServerSupabaseClient, SINGLETON_COMPANY_ID } from "@/lib/supabase/server";
import { SHARIA_COOKIE } from "@/lib/company";

export async function updateCompanySettings(values: {
  name: string;
  base_currency: string;
  sharia_mode: boolean;
}): Promise<{ error?: string; note?: string }> {
  const supabase = getServerSupabaseClient();

  // The Sharia preference is stored either way: in the database when
  // connected, in a cookie in demo mode, so the mode is always usable.
  const store = await cookies();
  store.set(SHARIA_COOKIE, values.sharia_mode ? "true" : "false", {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    path: "/",
  });

  if (!supabase) {
    revalidatePath("/", "layout");
    return {
      note: "Sharia preference saved on this device. Company name and base currency need a Supabase connection.",
    };
  }

  const { error } = await supabase.from("company").upsert({
    id: SINGLETON_COMPANY_ID,
    name: values.name,
    base_currency: values.base_currency,
    sharia_mode: values.sharia_mode,
  });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { note: "Saved." };
}
