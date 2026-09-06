import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { getCompany } from "@/lib/company";
import { getEmployee } from "@/lib/employees";
import { computePaymentInsight } from "@/lib/payment-insight";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { employeeId, fees, dcaInstallments } = body as {
    employeeId: string;
    fees?: Record<string, number>;
    dcaInstallments?: number;
  };

  if (!employeeId) {
    return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
  }

  // Falls back to demo profiles when Supabase isn't connected, so the
  // comparator stays interactive out of the box.
  const { employee } = await getEmployee(employeeId);
  if (!employee) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }

  const { company } = await getCompany();
  const insight = await computePaymentInsight(
    getServerSupabaseClient(),
    employee,
    company.base_currency,
    company.sharia_mode,
    { fees, dcaInstallments },
  );

  return NextResponse.json(insight);
}
