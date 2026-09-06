export interface GlossaryTerm {
  term: string;
  explanation: string;
}

export const GLOSSARY: Record<string, GlossaryTerm> = {
  spot: {
    term: "Spot rate",
    explanation: "today's exchange rate — the one you'd get if you paid right now.",
  },
  forward: {
    term: "Forward",
    explanation:
      "an exchange rate locked in today for a conversion later: you may pay a little more now, but you know exactly what it will cost.",
  },
  wad: {
    term: "Wa'd",
    explanation:
      "a binding one-sided promise to buy or sell at a set price, used in Islamic finance in place of a conventional forward, with no interest component.",
  },
  volatility: {
    term: "Volatility",
    explanation: "how much an exchange rate usually moves, up or down, over a given period.",
  },
  dca: {
    term: "Spread-out payments (DCA)",
    explanation:
      "instead of one large transfer, several smaller ones over time, so the highs and lows even out.",
  },
  spread: {
    term: "Spread",
    explanation: "the gap between the real market rate and the rate your provider gives you — a hidden fee.",
  },
  multiCurrencyAccount: {
    term: "Multi-currency account",
    explanation: "an account that lets you hold and pay in several currencies without converting every time.",
  },
  stablecoin: {
    term: "Stablecoin",
    explanation: "a crypto token designed to hold a steady value, usually pegged to a currency like the US dollar.",
  },
  annualizedVolatility: {
    term: "Annualized volatility",
    explanation:
      "the typical size of an exchange rate's daily moves, scaled to a yearly figure so different currencies can be compared.",
  },
};
