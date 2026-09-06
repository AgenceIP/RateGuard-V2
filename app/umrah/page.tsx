"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Lightbulb, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type OriginCode = "CA" | "GB" | "EU" | "US" | "AU" | "OTHER";

const ORIGINS: { code: OriginCode; label: string; currency: string; available: boolean }[] = [
  { code: "CA", label: "Canada", currency: "CAD", available: true },
  { code: "GB", label: "United Kingdom", currency: "GBP", available: true },
  { code: "EU", label: "Eurozone Countries", currency: "EUR", available: true },
  { code: "US", label: "United States", currency: "USD", available: true },
  { code: "AU", label: "Australia", currency: "AUD", available: true },
  { code: "OTHER", label: "Other", currency: "USD", available: false },
];

// Indicative customer-side rates (local currency per 1 SAR), already including a
// representative provider markup over the mid-market rate. For illustration only —
// a live corridor quote would replace this table.
const LOCAL_PER_SAR: Record<string, number> = {
  CAD: 0.371,
  GBP: 0.214,
  EUR: 0.249,
  USD: 0.271,
  AUD: 0.419,
};

type Compliance = "conventional" | "shariah";

type Result = {
  currency: string;
  totalSar: number;
  sarPerPilgrim: number;
  totalLocal: number;
  transferFee: number;
  lockDeposit: number;
  finalPerPilgrim: number;
  origin: (typeof ORIGINS)[number];
  compliance: Compliance;
};

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
}

export default function UmrahPage() {
  const [agencyName, setAgencyName] = useState("");
  const [originCode, setOriginCode] = useState<OriginCode>("CA");
  const [pilgrims, setPilgrims] = useState("100");
  const [sarPerPilgrim, setSarPerPilgrim] = useState("5000");
  const [compliance, setCompliance] = useState<Compliance>("conventional");
  const [result, setResult] = useState<Result | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const origin = ORIGINS.find((o) => o.code === originCode) ?? ORIGINS[0];
    const nPilgrims = Number(pilgrims) || 0;
    const nSarPerPilgrim = Number(sarPerPilgrim) || 0;
    const rate = LOCAL_PER_SAR[origin.currency] ?? LOCAL_PER_SAR.USD;

    const totalSar = nPilgrims * nSarPerPilgrim;
    const totalLocal = totalSar * rate;
    const transferFee = totalLocal < 10000 ? 15 : 0;
    const lockDeposit = totalLocal * 0.1;
    const finalPerPilgrim = nPilgrims > 0 ? (totalLocal + transferFee) / nPilgrims : 0;

    setResult({
      currency: origin.currency,
      totalSar,
      sarPerPilgrim: nSarPerPilgrim,
      totalLocal,
      transferFee,
      lockDeposit,
      finalPerPilgrim,
      origin,
      compliance,
    });
  }

  return (
    <div className="max-w-4xl space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Overcoming Currency Volatility with Shariah-Compliant Concepts
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A working guide for Umrah agencies on protecting package pricing from Saudi Riyal swings — and how to do it
          in a way that respects Islamic financial frameworks.
        </p>
      </header>

      <Separator />

      <section className="space-y-4">
        <Card>
          <CardContent className="space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">The problem</p>
            <p className="text-sm leading-relaxed">
              Umrah agencies price their packages months in advance in local currency (e.g. CAD, USD, EUR), but must
              pay Saudi hotels and transport providers in Saudi Riyal (SAR) later. If the Riyal strengthens in those
              months, your profit margins disappear — or you&apos;re forced to ask pilgrims (pèlerins) for a price
              increase.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              The conventional solution
            </p>
            <p className="text-sm leading-relaxed">
              Corporations use a <strong>forward contract</strong> to lock in today&apos;s exchange rate for a future
              payment date.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              The Islamic finance alignment — Wa&apos;ad
            </p>
            <p className="text-sm leading-relaxed">
              In traditional Islamic finance, standard forward contracts can be problematic because they involve
              exchanging currencies at a future date without immediate possession. To solve this, modern Islamic
              financial scholars utilize the concept of <strong>Wa&apos;ad</strong> (a binding unilateral promise).
              Under a Wa&apos;ad structure:
            </p>
            <ul className="ml-4 list-disc space-y-1.5 text-sm leading-relaxed">
              <li>The agency or the provider makes a binding promise to execute a currency exchange at a specific rate on a future date.</li>
              <li>The actual transaction and exchange of money only occur on that future maturity date.</li>
            </ul>
            <p className="text-sm leading-relaxed">
              This eliminates currency risk entirely, allowing agencies to protect their pricing while respecting
              Islamic financial frameworks.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Agency assessment</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell us about your Umrah program and we&apos;ll check platform availability and compliance fit, then
            estimate a per-pilgrim rate-lock cost.
          </p>
        </div>

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="agencyName">Agency name</Label>
                  <Input
                    id="agencyName"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder="Al-Noor Travel"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Origin country</Label>
                  <Select value={originCode} onValueChange={(v) => v && setOriginCode(v as OriginCode)}>
                    <SelectTrigger className="w-full">
                      <SelectValue>{(v: OriginCode) => ORIGINS.find((o) => o.code === v)?.label ?? v}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {ORIGINS.map((o) => (
                        <SelectItem key={o.code} value={o.code}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Target destination currency</Label>
                  <div className="flex h-8 items-center rounded-lg border border-input bg-muted/50 px-2.5 text-sm text-muted-foreground">
                    SAR — Saudi Riyal
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pilgrims">Estimated number of pilgrims</Label>
                  <Input
                    id="pilgrims"
                    type="number"
                    min="1"
                    step="1"
                    value={pilgrims}
                    onChange={(e) => setPilgrims(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sarPerPilgrim">Land package cost per pilgrim (SAR)</Label>
                  <Input
                    id="sarPerPilgrim"
                    type="number"
                    min="0"
                    step="1"
                    value={sarPerPilgrim}
                    onChange={(e) => setSarPerPilgrim(e.target.value)}
                    placeholder="5000"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Accommodation, transport, and visa fees.</p>
                </div>
              </div>

              <fieldset className="space-y-2">
                <Label>Compliance preference</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label
                    className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-sm transition-colors ${
                      compliance === "conventional" ? "border-ring bg-accent/50" : "border-input"
                    }`}
                  >
                    <input
                      type="radio"
                      name="compliance"
                      value="conventional"
                      checked={compliance === "conventional"}
                      onChange={() => setCompliance("conventional")}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="block font-medium">Conventional</span>
                      <span className="block text-xs text-muted-foreground">Standard corporate forward contract</span>
                    </span>
                  </label>
                  <label
                    className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-sm transition-colors ${
                      compliance === "shariah" ? "border-ring bg-accent/50" : "border-input"
                    }`}
                  >
                    <input
                      type="radio"
                      name="compliance"
                      value="shariah"
                      checked={compliance === "shariah"}
                      onChange={() => setCompliance("shariah")}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="block font-medium">Strictly Shariah-certified required</span>
                      <span className="block text-xs text-muted-foreground">Only a certified structure will do</span>
                    </span>
                  </label>
                </div>
              </fieldset>

              <Button type="submit">Calculate &amp; check compatibility</Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {result && (
        <>
          <Separator />

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Results</h2>

            <Card>
              <CardContent className="flex gap-2.5 text-sm leading-relaxed">
                {result.origin.available ? (
                  <>
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0" style={{ color: "var(--good)" }} />
                    <span>
                      <strong>Status: Available.</strong> Digital foreign exchange platforms like OFX can legally
                      onboard your agency from your country to route payments directly to Saudi Arabia.
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" style={{ color: "var(--warning)" }} />
                    <span>
                      <strong>Status: Manual review needed.</strong> Standard digital cross-border platforms may have
                      strict local licensing restrictions in your region. Contact our team to review alternative
                      corridor providers.
                    </span>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex gap-2.5 text-sm leading-relaxed">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                {result.compliance === "shariah" ? (
                  <span>
                    <strong>Important Shariah note:</strong> Standard corporate forward contracts offered by
                    conventional fintech providers like OFX offer the exact economic structure of a Wa&apos;ad but
                    typically lack formal Shariah certification boards. Because you selected strict compliance, we
                    can help guide you to execute this exact same framework through a dedicated Islamic corporate
                    banking desk.
                  </span>
                ) : (
                  <span>
                    <strong>Operational note:</strong> You can utilize standard corporate forward contracts. Ensure
                    you maintain a 5% to 10% liquidity buffer for the required initial margin deposit.
                  </span>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Per-pilgrim cost lock-in estimate</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead>Package summary (total group)</TableHead>
                      <TableHead>Per pilgrim breakdown</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Total Saudi Riyal required</TableCell>
                      <TableCell>{fmt(result.totalSar, "SAR")}</TableCell>
                      <TableCell>{fmt(result.sarPerPilgrim, "SAR")}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Est. local currency cost</TableCell>
                      <TableCell>{fmt(result.totalLocal, result.currency)}</TableCell>
                      <TableCell>{fmt(result.finalPerPilgrim, result.currency)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Platform transfer fee</TableCell>
                      <TableCell>{fmt(result.transferFee, result.currency)}</TableCell>
                      <TableCell className="text-muted-foreground">Included above</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Upfront rate-lock deposit (10%)</TableCell>
                      <TableCell>{fmt(result.lockDeposit, result.currency)}</TableCell>
                      <TableCell className="text-muted-foreground">Agency operational capital</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <p className="mt-3 text-xs text-muted-foreground">
                  Indicative rates for illustration only, using a representative provider markup over the mid-market
                  rate — not a live quote. Connect a corridor provider for a firm rate.
                </p>
              </CardContent>
            </Card>
          </section>
        </>
      )}

      <Separator />

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium">Ready to protect your pricing?</p>
            <p className="text-sm text-muted-foreground">Talk to a specialist about locking in your SAR exposure.</p>
          </div>
          <Button
            render={
              <a href="mailto:hello@rateguard.app?subject=Umrah%20FX%20hedging%20enquiry">
                <Mail className="size-4" />
                Speak to an Umrah Currency Hedging Specialist
              </a>
            }
            nativeButton={false}
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button render={<Link href="/sharia" />} nativeButton={false} variant="outline">
          Read more on Sharia-compliant alternatives
        </Button>
        <Button render={<Link href="/" />} nativeButton={false} variant="ghost">
          Back to payments
        </Button>
      </div>
    </div>
  );
}
