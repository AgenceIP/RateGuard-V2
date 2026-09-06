/**
 * Reference list of payment / FX providers and the risk-management tools they
 * offer.
 *
 * Honesty rules applied here, same as everywhere else in the app:
 *  - No provider fee is fetched live (none of them expose a free pricing API),
 *    so every range is a published order of magnitude, dated, with a link to
 *    the provider's own pricing page for the user to verify.
 *  - Sharia status is never asserted as a certification. It says what the
 *    structure normally looks like and what the user must ask the provider.
 */

export const PROVIDERS_REVIEWED_AT = "2026-09-06";

export type ProviderCategory = "multi_currency" | "fx_broker" | "bank" | "islamic";

export type ProviderShariaStatus = "generally_compatible" | "depends_on_product" | "generally_not_compatible";

export interface Provider {
  id: string;
  name: string;
  category: ProviderCategory;
  summary: string;
  /** Risk-management tools the provider is generally known to offer. */
  tools: string[];
  /** Published order of magnitude for the all-in FX margin, as decimals. Null when it varies too much to state. */
  typicalMarginRange: [number, number] | null;
  marginNote: string;
  shariaStatus: ProviderShariaStatus;
  shariaNote: string;
  url: string;
}

export const CATEGORY_LABELS: Record<ProviderCategory, string> = {
  multi_currency: "Multi-currency account",
  fx_broker: "FX broker",
  bank: "Traditional bank",
  islamic: "Islamic finance",
};

export const SHARIA_STATUS_LABELS: Record<ProviderShariaStatus, string> = {
  generally_compatible: "Generally compatible",
  depends_on_product: "Depends on the product",
  generally_not_compatible: "Generally not compatible",
};

export const PROVIDERS: Provider[] = [
  {
    id: "wise",
    name: "Wise Business",
    category: "multi_currency",
    summary:
      "Multi-currency account: you hold balances in several currencies and pay straight out of the right one, without converting on every transfer.",
    tools: ["Conversion at today's rate", "Multi-currency balances", "Batch payments"],
    typicalMarginRange: [0.004, 0.02],
    marginNote:
      "Fees shown explicitly per corridor, generally far below a bank's. The rate used is the market rate, with no hidden margin.",
    shariaStatus: "depends_on_product",
    shariaNote:
      "The conversion is immediate, which fits the hand-to-hand principle. What to check: if the balance earns interest or any yield, that's a problem — ask about the account structure.",
    url: "https://wise.com/pricing",
  },
  {
    id: "airwallex",
    name: "Airwallex",
    category: "multi_currency",
    summary:
      "Business-oriented multi-currency account, with local collection in several currencies and outbound payments to many countries.",
    tools: ["Conversion at today's rate", "Multi-currency balances", "Local collection", "Some hedging products"],
    typicalMarginRange: [0.005, 0.01],
    marginNote: "Stated margin over the interbank rate, varying by corridor and monthly volume.",
    shariaStatus: "depends_on_product",
    shariaNote:
      "Spot conversions raise no particular issue. Their hedging products, however, are conventional instruments — avoid those in Sharia mode.",
    url: "https://www.airwallex.com",
  },
  {
    id: "revolut-business",
    name: "Revolut Business",
    category: "multi_currency",
    summary: "Multi-currency business account, convenient for smaller recurring volumes.",
    tools: ["Conversion at today's rate", "Multi-currency balances"],
    typicalMarginRange: [0.004, 0.03],
    marginNote:
      "Often at the interbank rate within your plan's allowance, with a markup beyond it and outside market hours — check your tier.",
    shariaStatus: "depends_on_product",
    shariaNote: "Same thing to watch as the other multi-currency accounts: check whether the balance earns interest.",
    url: "https://www.revolut.com/business",
  },
  {
    id: "payoneer",
    name: "Payoneer",
    category: "multi_currency",
    summary: "Widely used for paying independent contractors, particularly across Southeast Asia and Latin America.",
    tools: ["Contractor payouts", "Receiving in local currency"],
    typicalMarginRange: [0.005, 0.03],
    marginNote: "The conversion margin sits on top of fixed withdrawal fees — look at the total cost, not just the stated fee.",
    shariaStatus: "depends_on_product",
    shariaNote: "Spot conversion, so no objection in principle. Check whether the balance is remunerated.",
    url: "https://www.payoneer.com",
  },
  {
    id: "fx-broker",
    name: "FX broker (OFX, Convera, Corpay…)",
    category: "fx_broker",
    summary:
      "Corporate FX specialists. This is where you get rates locked ahead of time, with a real account manager for larger amounts.",
    tools: ["Rate locked ahead (forward)", "Limit order", "Conversion at today's rate"],
    typicalMarginRange: [0.005, 0.015],
    marginNote:
      "The margin is negotiable and depends heavily on annual volume. Always ask for a written quote alongside the market rate at that moment.",
    shariaStatus: "generally_not_compatible",
    shariaNote:
      "Their flagship product, the conventional forward, is priced on the interest-rate differential between the two currencies — precisely what Islamic finance sets out to avoid. Their spot conversions don't carry that problem.",
    url: "https://www.ofx.com",
  },
  {
    id: "traditional-bank",
    name: "Your usual business bank",
    category: "bank",
    summary:
      "The default option, and almost always the most expensive: the margin is built into the quoted rate rather than billed separately.",
    tools: ["International wire", "Rate locked ahead on request"],
    typicalMarginRange: [0.02, 0.04],
    marginNote:
      "The cost is rarely shown as a 'fee': it hides in the gap between the market rate and the rate you're given. That gap is exactly what the payment-history analysis measures.",
    shariaStatus: "generally_not_compatible",
    shariaNote:
      "A conventional bank funds itself on interest, and its hedging products are built on a rate differential. Look instead at an Islamic bank or an Islamic window.",
    url: "",
  },
  {
    id: "islamic-bank",
    name: "Islamic bank or Islamic window",
    category: "islamic",
    summary:
      "Institutions offering interest-free hedging structures, generally based on a one-sided promise (Wa'd) and supervised by a Sharia board.",
    tools: ["Spot exchange (sarf)", "Wa'd-based hedging", "Interest-free accounts (Wadiah / Qard)"],
    typicalMarginRange: null,
    marginNote:
      "Pricing for these products is almost never public: you have to ask for a quote. Compare it to that day's market rate to see the real margin.",
    shariaStatus: "generally_compatible",
    shariaNote:
      "Still worth verifying: that a Sharia board exists, that products follow AAOIFI standards, and that the promise really is one-sided — a binding mutual promise is rejected by some scholars.",
    url: "https://aaoifi.com",
  },
];

export function providerById(id: string): Provider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}
