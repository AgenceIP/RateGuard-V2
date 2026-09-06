export type PaymentFrequency = "weekly" | "biweekly" | "monthly" | "custom";

export type EmployeeType = "employee" | "contractor";

export interface Company {
  id: string;
  name: string;
  base_currency: string;
  sharia_mode: boolean;
  created_at?: string;
}

export interface Employee {
  id: string;
  name: string;
  country_code: string;
  currency: string;
  amount: number;
  frequency: PaymentFrequency;
  custom_frequency_days: number | null;
  type: EmployeeType;
  active: boolean;
  next_payment_date: string | null;
  created_at?: string;
}

export interface PaymentHistoryEntry {
  id: string;
  employee_id: string;
  paid_at: string;
  amount_source_currency: number;
  /** Total debited from the company account in its base currency, fees included. */
  total_cost_base_currency: number | null;
  fx_rate_used: number | null;
  fees_paid: number | null;
  notes: string | null;
}

export interface CryptoRegulatoryStatus {
  country_code: string;
  status: string;
  risks: string[];
  sources: { label: string; url: string | null }[];
  summary: string;
  checked_at: string;
  origin: "live" | "cache-fresh" | "cache-stale" | "baseline";
}

export type ShariaCompliance = "compliant" | "generally_not_compliant" | "depends_on_provider";

export function frequencyToDays(freq: PaymentFrequency, customDays: number | null): number {
  switch (freq) {
    case "weekly":
      return 7;
    case "biweekly":
      return 14;
    case "monthly":
      return 30;
    case "custom":
      return customDays && customDays > 0 ? customDays : 30;
  }
}

export const FREQUENCY_LABELS: Record<PaymentFrequency, string> = {
  weekly: "Weekly (7 days)",
  biweekly: "Every 2 weeks (14 days)",
  monthly: "Monthly (30 days)",
  custom: "Custom",
};
