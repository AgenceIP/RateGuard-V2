"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CryptoStatusCard } from "@/components/CryptoStatusCard";
import { COUNTRIES } from "@/lib/data/countries";
import type { CryptoRegulatoryStatus } from "@/lib/types";

export default function CryptoCheckPage() {
  const [countryCode, setCountryCode] = useState("PH");
  const [status, setStatus] = useState<CryptoRegulatoryStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [shariaMode, setShariaMode] = useState(false);

  useEffect(() => {
    startTransition(async () => {
      const res = await fetch(`/api/crypto-status?country=${countryCode}`);
      const json = await res.json();
      if (!res.ok) {
        setStatus(null);
        setError(json.error ?? "Unknown error.");
        return;
      }
      setError(null);
      setStatus(json);
    });
  }, [countryCode, startTransition]);

  const country = COUNTRIES.find((c) => c.code === countryCode);

  return (
    <div className="max-w-3xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Can you pay a salary in crypto?</h1>
        <p className="text-sm text-muted-foreground">
          General regulatory status by country, with the concrete risks if you do it anyway. Verified live on the web when
          an Anthropic API key is configured; otherwise a dated internal baseline, never presented as current.
        </p>
      </header>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-x-6 gap-y-4">
          <div className="space-y-1.5">
            <Label>Employee or contractor&apos;s country</Label>
            <Select value={countryCode} onValueChange={(v) => v && setCountryCode(v)}>
              <SelectTrigger className="w-64">
                <SelectValue>{(v: string) => COUNTRIES.find((c) => c.code === v)?.name ?? v}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2.5">
            <Switch checked={shariaMode} onCheckedChange={setShariaMode} id="sharia-note" />
            <Label htmlFor="sharia-note" className="text-sm font-normal text-muted-foreground">
              Show the Sharia compliance note
            </Label>
          </div>
        </CardContent>
      </Card>

      {pending && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Looking up the regulatory status…
        </p>
      )}

      {error && !pending && (
        <Card>
          <CardContent className="py-4 text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      )}

      {status && !pending && (
        <CryptoStatusCard countryName={country?.name ?? countryCode} status={status} showSharia={shariaMode} />
      )}
    </div>
  );
}
