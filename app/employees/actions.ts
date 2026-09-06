"use server";

import { revalidatePath } from "next/cache";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { getCompany } from "@/lib/company";
import { DEMO_EMPLOYEES, buildDemoHistory } from "@/lib/demo-data";
import { getHistoricalRates } from "@/lib/fx/frankfurter";
import type { EmployeeFormValues } from "@/components/EmployeeForm";

const NOT_CONNECTED_ERROR =
  "Supabase isn't connected. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local (see the README).";

export async function createEmployee(values: EmployeeFormValues): Promise<{ error?: string }> {
  const supabase = getServerSupabaseClient();
  if (!supabase) return { error: NOT_CONNECTED_ERROR };

  const { error } = await supabase.from("employees").insert({
    name: values.name,
    country_code: values.country_code,
    currency: values.currency,
    amount: values.amount,
    frequency: values.frequency,
    custom_frequency_days: values.custom_frequency_days ?? null,
    type: values.type,
    next_payment_date: values.next_payment_date,
    active: true,
  });

  if (error) return { error: error.message };

  revalidatePath("/employees");
  revalidatePath("/");
  return {};
}

export async function updateEmployee(id: string, values: EmployeeFormValues): Promise<{ error?: string }> {
  const supabase = getServerSupabaseClient();
  if (!supabase) return { error: NOT_CONNECTED_ERROR };

  const { error } = await supabase
    .from("employees")
    .update({
      name: values.name,
      country_code: values.country_code,
      currency: values.currency,
      amount: values.amount,
      frequency: values.frequency,
      custom_frequency_days: values.custom_frequency_days ?? null,
      type: values.type,
      next_payment_date: values.next_payment_date,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/employees");
  revalidatePath(`/employees/${id}`);
  revalidatePath("/");
  return {};
}

export async function deleteEmployee(id: string): Promise<{ error?: string }> {
  const supabase = getServerSupabaseClient();
  if (!supabase) return { error: NOT_CONNECTED_ERROR };

  const { error } = await supabase.from("employees").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/employees");
  revalidatePath("/");
  return {};
}

export async function addPaymentHistory(
  employeeId: string,
  values: {
    paid_at: string;
    amount_source_currency: number;
    total_cost_base_currency: number | null;
    fx_rate_used: number | null;
    fees_paid: number | null;
    notes: string | null;
  },
): Promise<{ error?: string }> {
  const supabase = getServerSupabaseClient();
  if (!supabase) return { error: NOT_CONNECTED_ERROR };

  const { error } = await supabase.from("payment_history").insert({
    employee_id: employeeId,
    paid_at: values.paid_at,
    amount_source_currency: values.amount_source_currency,
    total_cost_base_currency: values.total_cost_base_currency,
    fx_rate_used: values.fx_rate_used,
    fees_paid: values.fees_paid,
    notes: values.notes,
  });

  if (error) return { error: error.message };

  revalidatePath(`/employees/${employeeId}`);
  return {};
}

export async function setEmployeeActive(id: string, active: boolean): Promise<{ error?: string }> {
  const supabase = getServerSupabaseClient();
  if (!supabase) return { error: NOT_CONNECTED_ERROR };

  const { error } = await supabase.from("employees").update({ active }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/employees");
  revalidatePath("/");
  return {};
}

/**
 * Populates the real, connected database with the same profiles used in
 * demo mode (lib/demo-data.ts) plus priced payment history, so a freshly
 * connected Supabase project has something to look at and track. Only
 * offered — and only runs — on an empty team, so re-clicking can't pile up
 * duplicates.
 */
export async function seedDemoData(): Promise<{ error?: string; seeded?: number }> {
  const supabase = getServerSupabaseClient();
  if (!supabase) return { error: NOT_CONNECTED_ERROR };

  const { count } = await supabase.from("employees").select("id", { count: "exact", head: true });
  if (count && count > 0) return { error: "You already have team members — seed only runs on an empty team." };

  const { company } = await getCompany();
  let seeded = 0;

  for (const demo of DEMO_EMPLOYEES) {
    const { data: inserted, error: employeeError } = await supabase
      .from("employees")
      .insert({
        name: demo.name,
        country_code: demo.country_code,
        currency: demo.currency,
        amount: demo.amount,
        frequency: demo.frequency,
        custom_frequency_days: demo.custom_frequency_days,
        type: demo.type,
        active: demo.active,
        next_payment_date: demo.next_payment_date,
      })
      .select("id")
      .single();

    if (employeeError || !inserted) continue;
    seeded++;

    const series = await getHistoricalRates(supabase, company.base_currency, demo.currency, 400).catch(() => []);
    const history = buildDemoHistory(demo, series);
    if (history.length === 0) continue;

    await supabase.from("payment_history").insert(
      history.map((entry) => ({
        employee_id: inserted.id,
        paid_at: entry.paid_at,
        amount_source_currency: entry.amount_source_currency,
        total_cost_base_currency: entry.total_cost_base_currency,
        fx_rate_used: entry.fx_rate_used,
        fees_paid: entry.fees_paid,
        notes: entry.notes,
      })),
    );
  }

  revalidatePath("/employees");
  revalidatePath("/");
  return { seeded };
}
