"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { updateCompanySettings } from "./actions";
import type { Company } from "@/lib/types";

const BASE_CURRENCIES = ["CAD", "USD", "EUR", "GBP", "AUD"];

export function SettingsForm({ company, connected }: { company: Company; connected: boolean }) {
  const [name, setName] = useState(company.name);
  const [baseCurrency, setBaseCurrency] = useState(company.base_currency);
  const [shariaMode, setShariaMode] = useState(company.sharia_mode);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const result = await updateCompanySettings({ name, base_currency: baseCurrency, sharia_mode: shariaMode });
      setMessage(result?.error ?? result?.note ?? "Enregistré.");
    });
  }

  return (
    <div className="max-w-md space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="company-name">Company name</Label>
        <Input id="company-name" value={name} onChange={(e) => setName(e.target.value)} disabled={!connected} />
      </div>

      <div className="space-y-1.5">
        <Label>Company base currency</Label>
        <Select value={baseCurrency} onValueChange={(v) => v && setBaseCurrency(v)} disabled={!connected}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BASE_CURRENCIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
        <div>
          <p className="text-sm font-medium">Sharia-compliant mode</p>
          <p className="mt-0.5 max-w-md text-xs text-muted-foreground">
            Shows a compliance badge on every option, replaces the conventional forward with an interest-free Wa&apos;d
            (one-sided promise) alternative, and unlocks the guide to alternatives without a forward.
          </p>
        </div>
        <Switch checked={shariaMode} onCheckedChange={setShariaMode} />
      </div>

      <Button onClick={handleSave} disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
