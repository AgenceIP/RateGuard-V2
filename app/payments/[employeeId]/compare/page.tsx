import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { getCompany } from "@/lib/company";
import { getEmployee } from "@/lib/employees";
import { computePaymentInsight } from "@/lib/payment-insight";
import { DemoBanner } from "@/components/DemoBanner";
import { CompareClient } from "./CompareClient";
import { countryByCode } from "@/lib/data/countries";
import { daysUntilLabel, money } from "@/lib/format";

export default async function ComparePage({ params }: { params: Promise<{ employeeId: string }> }) {
  const { employeeId } = await params;
  const { employee, demo } = await getEmployee(employeeId);
  if (!employee) notFound();

  const supabase = getServerSupabaseClient();
  const { company } = await getCompany();
  const insight = await computePaymentInsight(supabase, employee, company.base_currency, company.sharia_mode);
  const country = countryByCode(employee.country_code);

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to upcoming payments
      </Link>

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{employee.name}</h1>
        <p className="text-sm text-muted-foreground">
          {money(employee.amount, employee.currency)} to {country?.name ?? employee.country_code} ·{" "}
          {daysUntilLabel(employee.next_payment_date)} · all costs shown in {company.base_currency}, your company&apos;s
          currency
        </p>
        {demo && <DemoBanner compact />}
      </header>

      <CompareClient
        employee={employee}
        baseCurrency={company.base_currency}
        shariaMode={company.sharia_mode}
        isDemo={demo}
        initialInsight={insight}
      />
    </div>
  );
}
