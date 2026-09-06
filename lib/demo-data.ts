import type { RatePoint } from "@/lib/fx/frankfurter";
import type { Company, Employee, PaymentHistoryEntry } from "@/lib/types";

/**
 * Demo profiles used when Supabase isn't connected, so the app is explorable
 * out of the box.
 *
 * IMPORTANT — what is and isn't made up here: the *people, amounts and pay
 * schedules* below are invented examples. Every exchange rate, volatility
 * figure and cost estimate computed from them is real, fetched live from the
 * ECB via Frankfurter. The UI says so explicitly (see DemoBanner) so nobody
 * mistakes a demo profile for a real payment.
 *
 * Nigeria (NGN) is deliberately included: Frankfurter/ECB publishes no NGN
 * rate, so it demonstrates the "no reliable data for this currency" state
 * instead of hiding it.
 */

function inDays(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export const DEMO_COMPANY: Company = {
  id: "demo-company",
  name: "Northshore Studio (demo)",
  base_currency: "CAD",
  sharia_mode: false,
};

export const DEMO_EMPLOYEES: Employee[] = [
  {
    id: "demo-maria",
    name: "Maria Santos",
    country_code: "PH",
    currency: "PHP",
    amount: 85000,
    frequency: "monthly",
    custom_frequency_days: null,
    type: "contractor",
    active: true,
    next_payment_date: inDays(12),
  },
  {
    id: "demo-lucas",
    name: "Lucas Moreau",
    country_code: "FR",
    currency: "EUR",
    amount: 4200,
    frequency: "monthly",
    custom_frequency_days: null,
    type: "employee",
    active: true,
    next_payment_date: inDays(21),
  },
  {
    id: "demo-amara",
    name: "Amara Iyer",
    country_code: "IN",
    currency: "INR",
    amount: 180000,
    frequency: "monthly",
    custom_frequency_days: null,
    type: "employee",
    active: true,
    next_payment_date: inDays(9),
  },
  {
    id: "demo-sofia",
    name: "Sofía Ramírez",
    country_code: "MX",
    currency: "MXN",
    amount: 42000,
    frequency: "biweekly",
    custom_frequency_days: null,
    type: "contractor",
    active: true,
    next_payment_date: inDays(5),
  },
  {
    id: "demo-james",
    name: "James Okoro",
    country_code: "NG",
    currency: "NGN",
    amount: 1200000,
    frequency: "monthly",
    custom_frequency_days: null,
    type: "contractor",
    active: true,
    next_payment_date: inDays(16),
  },
];

export function demoEmployeeById(id: string): Employee | undefined {
  return DEMO_EMPLOYEES.find((e) => e.id === id);
}

/**
 * Past payments for the demo profiles.
 *
 * Only the *margin* is invented (a plausible bank-style spread that varies a
 * little from month to month, as it does in reality). The cost each payment is
 * measured against is the real ECB rate for that date — see buildDemoHistory —
 * so the fee analysis genuinely computes its answer instead of reading back a
 * hardcoded one.
 */
const DEMO_MARGINS: Record<string, number[]> = {
  "demo-maria": [0.031, 0.028, 0.03, 0.027, 0.029, 0.026],
  "demo-lucas": [0.019, 0.021, 0.018, 0.022, 0.02, 0.019],
  "demo-amara": [0.034, 0.031, 0.033, 0.03, 0.032, 0.035],
  "demo-sofia": [0.025, 0.023, 0.026, 0.024, 0.027, 0.022],
  "demo-james": [],
};

/** Turns the demo margins into payment records priced off the real rate for each date. */
export function buildDemoHistory(employee: Employee, series: RatePoint[]): PaymentHistoryEntry[] {
  const margins = DEMO_MARGINS[employee.id] ?? [];
  if (margins.length === 0 || series.length === 0) return [];

  const intervalDays = employee.frequency === "biweekly" ? 14 : 30;
  const sorted = [...series].sort((a, b) => a.date.localeCompare(b.date));

  return margins.map((margin, index) => {
    const paidAt = inDays(-intervalDays * (index + 1));

    let rate = sorted[0].rate;
    for (const point of sorted) {
      if (point.date <= paidAt) rate = point.rate;
      else break;
    }

    const midMarketCost = employee.amount / rate;

    return {
      id: `${employee.id}-history-${index}`,
      employee_id: employee.id,
      paid_at: paidAt,
      amount_source_currency: employee.amount,
      total_cost_base_currency: Math.round(midMarketCost * (1 + margin) * 100) / 100,
      fx_rate_used: null,
      fees_paid: null,
      notes: null,
    };
  });
}
