"use server";

import { revalidatePath } from "next/cache";
import { getServerSupabaseClient } from "@/lib/supabase/server";
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
