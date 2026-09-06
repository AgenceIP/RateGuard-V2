// Reference mapping only (ISO country -> name/currency) — not financial data.
export interface CountryRef {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  currency: string; // ISO 4217
}

export const COUNTRIES: CountryRef[] = [
  { code: "CA", name: "Canada", currency: "CAD" },
  { code: "US", name: "United States", currency: "USD" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "FR", name: "France", currency: "EUR" },
  { code: "DE", name: "Germany", currency: "EUR" },
  { code: "ES", name: "Spain", currency: "EUR" },
  { code: "IT", name: "Italy", currency: "EUR" },
  { code: "IE", name: "Ireland", currency: "EUR" },
  { code: "PT", name: "Portugal", currency: "EUR" },
  { code: "NL", name: "Netherlands", currency: "EUR" },
  { code: "CH", name: "Switzerland", currency: "CHF" },
  { code: "SE", name: "Sweden", currency: "SEK" },
  { code: "NO", name: "Norway", currency: "NOK" },
  { code: "DK", name: "Denmark", currency: "DKK" },
  { code: "PL", name: "Poland", currency: "PLN" },
  { code: "CZ", name: "Czechia", currency: "CZK" },
  { code: "RO", name: "Romania", currency: "RON" },
  { code: "HU", name: "Hungary", currency: "HUF" },
  { code: "TR", name: "Türkiye", currency: "TRY" },
  { code: "IL", name: "Israel", currency: "ILS" },
  { code: "AE", name: "United Arab Emirates", currency: "AED" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR" },
  { code: "QA", name: "Qatar", currency: "QAR" },
  { code: "EG", name: "Egypt", currency: "EGP" },
  { code: "MA", name: "Morocco", currency: "MAD" },
  { code: "TN", name: "Tunisia", currency: "TND" },
  { code: "NG", name: "Nigeria", currency: "NGN" },
  { code: "ZA", name: "South Africa", currency: "ZAR" },
  { code: "KE", name: "Kenya", currency: "KES" },
  { code: "GH", name: "Ghana", currency: "GHS" },
  { code: "IN", name: "India", currency: "INR" },
  { code: "PK", name: "Pakistan", currency: "PKR" },
  { code: "BD", name: "Bangladesh", currency: "BDT" },
  { code: "ID", name: "Indonesia", currency: "IDR" },
  { code: "MY", name: "Malaysia", currency: "MYR" },
  { code: "PH", name: "Philippines", currency: "PHP" },
  { code: "TH", name: "Thailand", currency: "THB" },
  { code: "SG", name: "Singapore", currency: "SGD" },
  { code: "VN", name: "Vietnam", currency: "VND" },
  { code: "CN", name: "China", currency: "CNY" },
  { code: "JP", name: "Japan", currency: "JPY" },
  { code: "KR", name: "South Korea", currency: "KRW" },
  { code: "AU", name: "Australia", currency: "AUD" },
  { code: "NZ", name: "New Zealand", currency: "NZD" },
  { code: "MX", name: "Mexico", currency: "MXN" },
  { code: "BR", name: "Brazil", currency: "BRL" },
  { code: "AR", name: "Argentina", currency: "ARS" },
  { code: "CO", name: "Colombia", currency: "COP" },
  { code: "CL", name: "Chile", currency: "CLP" },
  { code: "PE", name: "Peru", currency: "PEN" },
];

export function countryByCode(code: string): CountryRef | undefined {
  return COUNTRIES.find((c) => c.code === code);
}
