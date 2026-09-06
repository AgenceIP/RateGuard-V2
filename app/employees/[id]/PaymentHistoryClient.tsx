"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addPaymentHistory } from "@/app/employees/actions";
import type { PaymentHistoryEntry } from "@/lib/types";

export function PaymentHistoryClient({
  employeeId,
  history,
  currency,
  baseCurrency,
}: {
  employeeId: string;
  history: PaymentHistoryEntry[];
  currency: string;
  baseCurrency: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    const paid_at = formData.get("paid_at") as string;
    const amount = Number(formData.get("amount_source_currency"));
    const totalCost = Number(formData.get("total_cost_base_currency"));

    if (!paid_at || !amount || !totalCost) {
      setError("Date, amount sent and amount debited are all needed to measure the fee.");
      return;
    }

    startTransition(async () => {
      const result = await addPaymentHistory(employeeId, {
        paid_at,
        amount_source_currency: amount,
        total_cost_base_currency: totalCost,
        fx_rate_used: null,
        fees_paid: null,
        notes: null,
      });
      if (result?.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <p className="rounded-xl bg-accent/50 p-3 text-xs leading-relaxed">
        Every past payment you record here is used to <strong>measure your provider&apos;s real margin</strong>, by comparing
        it to the official ECB rate for that day. Two or three are enough for the comparator to stop using a generic
        estimate.
      </p>

      <div className="space-y-2">
        {history.length === 0 && <p className="text-sm text-muted-foreground">No past payments recorded yet.</p>}
        {history.map((h) => (
          <div key={h.id} className="flex justify-between rounded-lg border border-border px-3 py-2 text-sm">
            <span>{new Date(h.paid_at + "T00:00:00Z").toLocaleDateString("en-CA", { timeZone: "UTC" })}</span>
            <span className="tabular-nums">
              {h.amount_source_currency} {currency}
              {h.total_cost_base_currency ? ` · debited ${h.total_cost_base_currency} ${baseCurrency}` : ""}
            </span>
          </div>
        ))}
      </div>

      <form action={handleSubmit} className="grid gap-3 sm:grid-cols-3 sm:items-start">
        <div className="space-y-1">
          <Label htmlFor="paid_at">Payment date</Label>
          <Input id="paid_at" name="paid_at" type="date" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="amount_source_currency">Amount the person received</Label>
          <Input id="amount_source_currency" name="amount_source_currency" type="number" step="0.01" required />
          <p className="text-[11px] text-muted-foreground">in {currency}</p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="total_cost_base_currency">Amount debited from your account</Label>
          <Input id="total_cost_base_currency" name="total_cost_base_currency" type="number" step="0.01" required />
          <p className="text-[11px] text-muted-foreground">in {baseCurrency}, as it appears on your statement</p>
        </div>
        <Button type="submit" disabled={pending} className="w-fit sm:col-span-3">
          {pending ? "Adding…" : "Add this payment"}
        </Button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
