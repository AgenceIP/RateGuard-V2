import type { CryptoRegulatoryStatus } from "@/lib/types";

/**
 * Baseline fallback, used only when there's no live web-search result and no
 * Supabase cache (mirrors supabase/seed.sql). It is deliberately dated in the
 * past and labelled "baseline" everywhere it surfaces, so the UI never passes
 * it off as a current verification.
 */
export const BASELINE_CHECKED_AT = "2025-01-01T00:00:00Z";

const GENERIC_SOURCE = [
  {
    label: "Internal baseline, not verified live — confirm with a live search or a local advisor",
    url: null,
  },
];

const VOLATILITY_RISK = "Token volatility, unless it's a stablecoin";
const CONVERSION_RISK = "Local banking restrictions on converting to local currency";
const PROTECTION_RISK = "No legal protection for the worker if the value drops";

type BaselineEntry = Omit<CryptoRegulatoryStatus, "origin" | "checked_at" | "sources"> & {
  sources?: { label: string; url: string | null }[];
};

const ENTRIES: Record<string, BaselineEntry> = {
  US: {
    country_code: "US",
    status: "Not legal tender; paying salary in crypto is non-standard",
    risks: [
      VOLATILITY_RISK,
      "Federal wage law (FLSA) generally requires payment in legal tender (USD)",
      "Complex tax treatment for both employer and employee",
      PROTECTION_RISK,
    ],
    summary:
      "In the United States, crypto is not legal tender and federal minimum-wage law generally requires payment in USD. Paying a salary in crypto remains legally risky without a purpose-built structure.",
  },
  CA: {
    country_code: "CA",
    status: "Not legal tender; paying salary in crypto is non-standard",
    risks: [
      VOLATILITY_RISK,
      "Provincial employment standards generally require payment in legal tender",
      CONVERSION_RISK,
      PROTECTION_RISK,
    ],
    summary:
      "In Canada, crypto is not legal tender. Some jurisdictions tolerate partial payment in kind with consent, but it is neither standard practice nor advisable without legal advice.",
  },
  GB: {
    country_code: "GB",
    status: "Not legal tender; taxable as employment income",
    risks: [
      VOLATILITY_RISK,
      "HMRC generally treats crypto received as pay as taxable income",
      CONVERSION_RISK,
      PROTECTION_RISK,
    ],
    summary:
      "In the United Kingdom, cryptoassets are not legal tender. HMRC generally taxes crypto received as remuneration, which complicates payroll.",
  },
  FR: {
    country_code: "FR",
    status: "Not legal tender; salary must be paid in euros",
    risks: [
      VOLATILITY_RISK,
      "The Labour Code requires salary to be paid in legal tender (the euro)",
      "The EU framework (MiCA) regulates service providers without making crypto legal tender",
      PROTECTION_RISK,
    ],
    summary:
      "In France, salary must be paid in euros. Cryptoassets are regulated at EU level for service providers, but do not constitute legal tender for payroll.",
  },
  IN: {
    country_code: "IN",
    status: "Legal status ambiguous; very heavy tax treatment on crypto",
    risks: [
      VOLATILITY_RISK,
      "Specific and very high taxation on crypto gains in India",
      CONVERSION_RISK,
      PROTECTION_RISK,
    ],
    summary:
      "In India, crypto is not legal tender and carries particularly heavy taxation, which makes paying salary in crypto impractical and risky.",
  },
  PH: {
    country_code: "PH",
    status: "Regulated by the central bank (BSP); salary must be in legal tender",
    risks: [
      VOLATILITY_RISK,
      "The Labour Code generally requires payment in legal tender (PHP)",
      CONVERSION_RISK,
      PROTECTION_RISK,
    ],
    summary:
      "In the Philippines, crypto service providers are regulated by the central bank (BSP), but employment law normally requires payment in Philippine pesos.",
  },
  NG: {
    country_code: "NG",
    status: "History of banking restrictions; the naira remains the only legal tender",
    risks: [
      VOLATILITY_RISK,
      "History of banking restrictions on crypto exchanges in Nigeria",
      "The naira remains the only legal tender for paying salary",
      PROTECTION_RISK,
    ],
    summary:
      "In Nigeria, the central bank has historically restricted links between banks and crypto platforms. The naira remains the only legal tender for payroll.",
  },
  MX: {
    country_code: "MX",
    status: "Regulated under the Fintech Law; salary must be in pesos",
    risks: [
      VOLATILITY_RISK,
      "Federal labour law requires payment in Mexican pesos",
      CONVERSION_RISK,
      PROTECTION_RISK,
    ],
    summary:
      "In Mexico, crypto exchanges are regulated under the Ley Fintech, but labour law requires salary to be paid in Mexican pesos.",
  },
  BR: {
    country_code: "BR",
    status: "A cryptoasset legal framework exists; salary must be in reais",
    risks: [
      VOLATILITY_RISK,
      "The legal framework regulates service providers without making crypto legal tender",
      "Labour law requires payment in Brazilian reais",
      PROTECTION_RISK,
    ],
    summary:
      "Brazil has a legal framework for cryptoasset service providers, but salary must generally be paid in Brazilian reais.",
  },
  ZA: {
    country_code: "ZA",
    status: "Crypto regulated as a financial product (FSCA); salary must be in rand",
    risks: [
      VOLATILITY_RISK,
      "The FSCA regulates crypto as a financial product, not as legal tender",
      "Labour law requires payment in South African rand",
      PROTECTION_RISK,
    ],
    summary:
      "In South Africa, the FSCA regulates cryptoassets as financial products, but salary must normally be paid in rand.",
  },
  PK: {
    country_code: "PK",
    status: "Legal status unsettled, historically discouraged by the central bank",
    risks: [
      VOLATILITY_RISK,
      "The SBP has historically discouraged the use of crypto",
      CONVERSION_RISK,
      PROTECTION_RISK,
    ],
    summary:
      "In Pakistan, the status of crypto remains unsettled and the central bank (SBP) has historically discouraged its use — paying salary in crypto is particularly risky there.",
  },
  ID: {
    country_code: "ID",
    status: "Treated as a tradable commodity; salary must be in rupiah",
    risks: [
      VOLATILITY_RISK,
      "Crypto is regulated as a trading commodity, not as legal tender",
      "Manpower law requires payment in Indonesian rupiah",
      PROTECTION_RISK,
    ],
    summary:
      "In Indonesia, crypto is regulated as a commodity for trading rather than legal tender, and labour law requires payment in rupiah.",
  },
  AE: {
    country_code: "AE",
    status: "Regulatory framework evolving (e.g. VARA in Dubai); still non-standard for payroll",
    risks: [
      VOLATILITY_RISK,
      "The regulatory framework is still young and differs between free zones",
      CONVERSION_RISK,
      PROTECTION_RISK,
    ],
    summary:
      "In the United Arab Emirates a regulatory framework is developing (e.g. VARA in Dubai), but paying salary in crypto remains non-standard and varies by free zone.",
  },
};

export function getBaselineCryptoStatus(countryCode: string): CryptoRegulatoryStatus | null {
  const entry = ENTRIES[countryCode];
  if (!entry) return null;

  return {
    ...entry,
    sources: entry.sources ?? GENERIC_SOURCE,
    checked_at: BASELINE_CHECKED_AT,
    origin: "baseline",
  };
}
