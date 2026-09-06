"use client";

import { useState, useTransition } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRIES } from "@/lib/data/countries";
import { FREQUENCY_LABELS, type Employee, type EmployeeType, type PaymentFrequency } from "@/lib/types";

const employeeSchema = z.object({
  name: z.string().min(1, "Name is required."),
  country_code: z.string().min(2, "Pick a country."),
  currency: z.string().min(3, "Currency is required."),
  amount: z.coerce.number().positive("Amount must be positive."),
  frequency: z.enum(["weekly", "biweekly", "monthly", "custom"]),
  custom_frequency_days: z.coerce.number().int().positive().nullable().optional(),
  type: z.enum(["employee", "contractor"]),
  next_payment_date: z.string().min(1, "Pick a date."),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;

export function EmployeeForm({
  initial,
  onSubmit,
  submitLabel = "Add",
}: {
  initial?: Partial<Employee>;
  onSubmit: (values: EmployeeFormValues) => Promise<{ error?: string } | void>;
  submitLabel?: string;
}) {
  const [countryCode, setCountryCode] = useState(initial?.country_code ?? "CA");
  const [currency, setCurrency] = useState(initial?.currency ?? "CAD");
  const [frequency, setFrequency] = useState<PaymentFrequency>(initial?.frequency ?? "biweekly");
  const [type, setType] = useState<EmployeeType>(initial?.type ?? "employee");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleCountryChange(code: string) {
    setCountryCode(code);
    const country = COUNTRIES.find((c) => c.code === code);
    if (country) setCurrency(country.currency);
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    const raw = {
      name: formData.get("name"),
      country_code: countryCode,
      currency,
      amount: formData.get("amount"),
      frequency,
      custom_frequency_days: frequency === "custom" ? formData.get("custom_frequency_days") : null,
      type,
      next_payment_date: formData.get("next_payment_date"),
    };

    const parsed = employeeSchema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid form.");
      return;
    }

    startTransition(async () => {
      const result = await onSubmit(parsed.data);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={initial?.name} required />
        </div>

        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={type} onValueChange={(v) => v && setType(v as EmployeeType)}>
            <SelectTrigger className="w-full">
              <SelectValue>{(v: EmployeeType) => (v === "employee" ? "Employee" : "Contractor")}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="contractor">Contractor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Country of payment</Label>
          <Select value={countryCode} onValueChange={(v) => v && handleCountryChange(v)}>
            <SelectTrigger className="w-full">
              <SelectValue>{(v: string) => COUNTRIES.find((c) => c.code === v)?.name ?? v}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name} ({c.currency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount per payment ({currency})</Label>
          <Input id="amount" name="amount" type="number" step="0.01" min="0" defaultValue={initial?.amount} required />
        </div>

        <div className="space-y-1.5">
          <Label>Pay frequency</Label>
          <Select value={frequency} onValueChange={(v) => v && setFrequency(v as PaymentFrequency)}>
            <SelectTrigger className="w-full">
              <SelectValue>{(v: PaymentFrequency) => FREQUENCY_LABELS[v] ?? v}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {frequency === "custom" && (
          <div className="space-y-1.5">
            <Label htmlFor="custom_frequency_days">Days between payments</Label>
            <Input
              id="custom_frequency_days"
              name="custom_frequency_days"
              type="number"
              min="1"
              defaultValue={initial?.custom_frequency_days ?? undefined}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="next_payment_date">Next payment date</Label>
          <Input
            id="next_payment_date"
            name="next_payment_date"
            type="date"
            defaultValue={initial?.next_payment_date ?? undefined}
            required
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
