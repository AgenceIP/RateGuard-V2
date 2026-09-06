import Link from "next/link";
import { AlertTriangle, ArrowRight, CalendarClock, Globe2, Wallet } from "lucide-react";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { getCompany } from "@/lib/company";
import { listEmployees } from "@/lib/employees";
import { computePaymentInsight, type PaymentInsight } from "@/lib/payment-insight";
import { DemoBanner } from "@/components/DemoBanner";
import { StatTile } from "@/components/StatTile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { countryByCode } from "@/lib/data/countries";
import { daysUntilLabel, initials, money } from "@/lib/format";
import type { Employee } from "@/lib/types";

// Payroll data must reflect the database on every request — the exchange-rate
// fetches keep their own 1 h cache inside this render, so this costs little.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = getServerSupabaseClient();
  const { company } = await getCompany();
  const { employees, demo } = await listEmployees({ activeOnly: true });

  const insights = await Promise.all(
    employees.map(async (employee) => ({
      employee,
      insight: await computePaymentInsight(supabase, employee, company.base_currency, company.sharia_mode),
    })),
  );

  const totalOutflow = insights.reduce((sum, { insight }) => sum + (insight.compare?.payNowCostBase ?? 0), 0);
  const totalRisk = insights.reduce((sum, { insight }) => sum + (insight.compare?.waitAndPayLater.riskOfWaitingBase ?? 0), 0);
  const currencies = new Set(employees.map((e) => e.currency));
  const missingData = insights.filter(({ insight }) => !insight.dataAvailable).length;
  const nextPayment = insights.find(({ employee }) => employee.next_payment_date);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Upcoming payments</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          For each payment coming up: what it will cost in real dollars, and what you can do to reduce the risk. No
          rate predictions — only ranges built from what actually happened.
        </p>
      </header>

      {demo && <DemoBanner />}

      {employees.length > 0 && (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Going out for these payments"
            value={money(totalOutflow, company.base_currency)}
            hint={`in ${company.base_currency}, estimated fees included`}
            icon={<Wallet className="size-3.5" />}
          />
          <StatTile
            label="Risk if you wait"
            value={`up to ${money(totalRisk, company.base_currency)}`}
            hint="unfavourable scenario, across all payments"
            tone="warning"
            icon={<AlertTriangle className="size-3.5" />}
          />
          <StatTile
            label="Currencies to manage"
            value={String(currencies.size)}
            hint={missingData > 0 ? `${missingData} without reliable rate data` : "all covered by the ECB"}
            icon={<Globe2 className="size-3.5" />}
          />
          <StatTile
            label="Next due"
            value={nextPayment ? daysUntilLabel(nextPayment.employee.next_payment_date) : "—"}
            hint={nextPayment ? nextPayment.employee.name : undefined}
            icon={<CalendarClock className="size-3.5" />}
          />
        </section>
      )}

      {employees.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-start gap-3 py-10">
            <p className="text-sm text-muted-foreground">No active employees or contractors yet.</p>
            <Button render={<Link href="/employees/new" />} nativeButton={false}>
              Add someone
            </Button>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4">
        {insights.map(({ employee, insight }) => (
          <PaymentCard
            key={employee.id}
            employee={employee}
            insight={insight}
            baseCurrency={company.base_currency}
          />
        ))}
      </section>
    </div>
  );
}

function PaymentCard({
  employee,
  insight,
  baseCurrency,
}: {
  employee: Employee;
  insight: PaymentInsight;
  baseCurrency: string;
}) {
  const country = countryByCode(employee.country_code);
  const risk = insight.compare?.waitAndPayLater.riskOfWaitingBase ?? null;

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
              {initials(employee.name)}
            </span>
            <div>
              <p className="font-medium leading-tight">{employee.name}</p>
              <p className="text-xs text-muted-foreground">
                {country?.name ?? employee.country_code} · {employee.type === "employee" ? "Employee" : "Contractor"} ·{" "}
                {money(employee.amount, employee.currency)}
              </p>
            </div>
          </div>

          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
            {daysUntilLabel(employee.next_payment_date)}
          </span>
        </div>

        <p
          className="rounded-xl border-l-2 bg-accent/50 px-4 py-3 text-sm leading-relaxed"
          style={{ borderColor: "var(--primary)" }}
        >
          {insight.plainSummary}
        </p>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
            <MiniStat
              label="If you pay today"
              value={insight.compare ? money(insight.compare.payNowCostBase, baseCurrency) : "—"}
            />
            <MiniStat
              label="Risk if you wait"
              value={risk !== null && risk > 0 ? `up to ${money(risk, baseCurrency)}` : "not measurable"}
              tone={risk !== null && risk > 0 ? "warning" : "muted"}
            />
            <MiniStat
              label="Volatility (365d)"
              value={insight.vol365d ? `${insight.vol365d.annualizedPct.toFixed(1)}%` : "no data"}
              tone={insight.vol365d ? "default" : "muted"}
            />
          </div>

          <Button
            render={<Link href={`/payments/${employee.id}/compare`} />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            Compare options
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "warning" | "muted" }) {
  const color = tone === "warning" ? "var(--warning)" : tone === "muted" ? "var(--muted-foreground)" : "var(--foreground)";
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-medium tabular-nums" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
