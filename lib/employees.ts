import "server-only";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { DEMO_EMPLOYEES, demoEmployeeById } from "@/lib/demo-data";
import type { Employee } from "@/lib/types";

/** True when Supabase isn't configured — the app then runs on demo profiles. */
export function isDemoMode(): boolean {
  return getServerSupabaseClient() === null;
}

export async function listEmployees(options: { activeOnly?: boolean } = {}): Promise<{
  employees: Employee[];
  demo: boolean;
}> {
  const supabase = getServerSupabaseClient();

  if (!supabase) {
    const employees = options.activeOnly ? DEMO_EMPLOYEES.filter((e) => e.active) : DEMO_EMPLOYEES;
    return { employees, demo: true };
  }

  let query = supabase.from("employees").select("*");
  if (options.activeOnly) query = query.eq("active", true);

  const { data } = await query.order("next_payment_date", { ascending: true });
  return { employees: (data as Employee[]) ?? [], demo: false };
}

export async function getEmployee(id: string): Promise<{ employee: Employee | null; demo: boolean }> {
  const supabase = getServerSupabaseClient();

  if (!supabase) {
    return { employee: demoEmployeeById(id) ?? null, demo: true };
  }

  const { data } = await supabase.from("employees").select("*").eq("id", id).maybeSingle();
  return { employee: (data as Employee) ?? null, demo: false };
}
