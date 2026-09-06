import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { getCompany } from "@/lib/company";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditEmployeeClient } from "./EditEmployeeClient";
import { PaymentHistoryClient } from "./PaymentHistoryClient";
import type { Employee, PaymentHistoryEntry } from "@/lib/types";

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getServerSupabaseClient();
  if (!supabase) notFound();

  const [{ data: employee }, { data: history }] = await Promise.all([
    supabase.from("employees").select("*").eq("id", id).maybeSingle(),
    supabase.from("payment_history").select("*").eq("employee_id", id).order("paid_at", { ascending: false }),
  ]);

  if (!employee) notFound();

  const { company } = await getCompany();

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{(employee as Employee).name}</h1>
        <Button render={<Link href={`/payments/${id}/compare`} />} nativeButton={false} variant="outline" size="sm">
          Compare options
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <EditEmployeeClient employee={employee as Employee} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment history (optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentHistoryClient
            employeeId={id}
            history={(history as PaymentHistoryEntry[]) ?? []}
            currency={(employee as Employee).currency}
            baseCurrency={company.base_currency}
          />
        </CardContent>
      </Card>
    </div>
  );
}
