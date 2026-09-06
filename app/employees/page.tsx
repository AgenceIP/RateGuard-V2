import Link from "next/link";
import { Plus } from "lucide-react";
import { listEmployees } from "@/lib/employees";
import { DemoBanner } from "@/components/DemoBanner";
import { SeedDemoDataButton } from "@/components/SeedDemoDataButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { countryByCode } from "@/lib/data/countries";
import { daysUntilLabel, initials, money } from "@/lib/format";
import { FREQUENCY_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const { employees, demo } = await listEmployees();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Team</h1>
          <p className="text-sm text-muted-foreground">
            The country, currency and pay frequency for everyone you pay.
          </p>
        </div>
        <Button render={<Link href="/employees/new" />} nativeButton={false}>
          <Plus className="size-4" />
          Add
        </Button>
      </header>

      {demo && <DemoBanner />}

      <div className="grid gap-3 sm:grid-cols-2">
        {employees.map((employee) => {
          const country = countryByCode(employee.country_code);
          const card = (
            <Card className="h-full transition-colors hover:bg-muted/40">
              <CardContent className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                  {initials(employee.name)}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium leading-tight">{employee.name}</p>
                    <Badge variant={employee.type === "employee" ? "secondary" : "outline"}>
                      {employee.type === "employee" ? "Employee" : "Contractor"}
                    </Badge>
                    {!employee.active && <Badge variant="destructive">Inactive</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {country?.name ?? employee.country_code} · {money(employee.amount, employee.currency)} ·{" "}
                    {FREQUENCY_LABELS[employee.frequency]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Next payment {daysUntilLabel(employee.next_payment_date)}
                  </p>
                </div>
              </CardContent>
            </Card>
          );

          return demo ? (
            <Link key={employee.id} href={`/payments/${employee.id}/compare`}>
              {card}
            </Link>
          ) : (
            <Link key={employee.id} href={`/employees/${employee.id}`}>
              {card}
            </Link>
          );
        })}

        {employees.length === 0 && !demo && (
          <div className="space-y-3 sm:col-span-2">
            <p className="text-sm text-muted-foreground">No employees or contractors yet.</p>
            <SeedDemoDataButton />
          </div>
        )}
      </div>
    </div>
  );
}
