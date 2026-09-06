/**
 * Educational content on managing currency risk without a conventional FX
 * forward.
 *
 * Framing rules used throughout: describe the *structure* and what it does,
 * name the point of scholarly disagreement where one exists instead of
 * flattening it, and never phrase anything as a ruling. Every screen that
 * shows this content ends with SHARIA_DISCLAIMER.
 */

export interface ShariaPrinciple {
  term: string;
  plain: string;
  consequence: string;
}

export const SHARIA_PRINCIPLES: ShariaPrinciple[] = [
  {
    term: "Riba",
    plain: "Interest: earning money purely from the passage of time, with no risk and no real activity.",
    consequence:
      "A conventional forward is priced on the interest-rate differential between the two currencies. That mechanism is the problem — not the fact that you want protection.",
  },
  {
    term: "Gharar",
    plain: "Excessive uncertainty: a contract where what is being exchanged, or when, stays unclear.",
    consequence:
      "Protecting yourself against currency risk is not gharar — it's the opposite. The problem comes from the structure of the contract, not from wanting less uncertainty.",
  },
  {
    term: "Sarf",
    plain: "The rules for exchanging currency: one currency for another must happen immediately, hand to hand.",
    consequence:
      "This is the central constraint here: a currency exchange deferred in time is problematic. Hence the appeal of solutions built on an immediate exchange rather than a promise of a future one.",
  },
];

export type AlternativeVerdict = "widely_accepted" | "accepted_with_conditions" | "debated";

export interface ShariaAlternative {
  id: string;
  name: string;
  arabicTerm?: string;
  howItWorks: string;
  whatItProtects: string;
  /** What it does NOT solve — stated so nobody over-trusts a single tool. */
  limits: string;
  whatToVerify: string[];
  verdict: AlternativeVerdict;
  verdictNote: string;
  /** Whether the app can already model this option in the comparator. */
  inComparator: boolean;
}

export const VERDICT_LABELS: Record<AlternativeVerdict, string> = {
  widely_accepted: "Widely accepted",
  accepted_with_conditions: "Accepted with conditions",
  debated: "Debated among scholars",
};

export const SHARIA_ALTERNATIVES: ShariaAlternative[] = [
  {
    id: "pay-now",
    name: "Pay immediately",
    arabicTerm: "Sarf",
    howItWorks:
      "You convert and send the money the same day. The currency exchange is instant, so there is no forward contract, no promise and no interest.",
    whatItProtects:
      "Removes currency risk entirely: once the payment is made, the rate can no longer move against you.",
    limits:
      "You need the cash available now. And you don't benefit from a favourable move either — which, to be clear, is unpredictable in both directions.",
    whatToVerify: [
      "The conversion really executes same-day, not deferred by two business days",
      "The rate applied is close to the market rate (measure it with your payment history)",
    ],
    verdict: "widely_accepted",
    verdictNote:
      "This is the least contested form of currency exchange: immediate, with nothing deferred. No special structure needs approval.",
    inComparator: true,
  },
  {
    id: "natural-hedge",
    name: "Natural currency matching",
    howItWorks:
      "You match revenue and expenses in the same currency. If you invoice clients in euros and pay someone in euros, there is simply nothing to convert.",
    whatItProtects:
      "Eliminates the exposure at its source, with no financial contract at all. It's the most robust protection there is.",
    limits:
      "Only possible if you actually earn revenue in that currency. It's a commercial decision as much as a financial one, and it takes time to put in place.",
    whatToVerify: [
      "The account receiving and holding the currency pays no interest on the balance",
      "Inbound and outbound volumes are of comparable size",
    ],
    verdict: "widely_accepted",
    verdictNote:
      "No financial contract is involved: this is ordinary business organisation. Nothing for a Sharia board to review.",
    inComparator: false,
  },
  {
    id: "prepay",
    name: "Pay early when the cash is there",
    howItWorks:
      "Rather than waiting for the due date, you settle the salary or invoice as soon as you have the cash. A variant is to fund the currency ahead of time in a dedicated account.",
    whatItProtects:
      "Shortens the window in which the rate can move against you: fewer days of exposure, less risk.",
    limits:
      "Ties up cash earlier. And if you pay a salary in advance, set it out clearly with the person concerned to avoid any misunderstanding.",
    whatToVerify: [
      "The account holding the currency generates no interest",
      "The agreement with the employee or contractor is explicit about what is paid and for which period",
    ],
    verdict: "widely_accepted",
    verdictNote: "Settling a genuine debt earlier raises no issue of principle.",
    inComparator: false,
  },
  {
    id: "multi-currency",
    name: "Interest-free multi-currency account",
    arabicTerm: "Wadiah / Qard",
    howItWorks:
      "You hold a balance in the currency you will need. Each payment goes out of that balance with no new conversion. The account must be structured as safekeeping (Wadiah) or an interest-free loan (Qard).",
    whatItProtects:
      "Removes the conversion on every payment — and so the repeated fees — and fixes your exposure at the moment you chose to fund the account.",
    limits:
      "You stay exposed on the balance you hold until you spend it. The risk is moved, not removed.",
    whatToVerify: [
      "The balance earns no interest or 'yield' on idle funds",
      "The legal nature of the deposit (safekeeping or loan) is confirmed in writing",
      "The conversion fee on the way in is known and compared to the market rate",
    ],
    verdict: "accepted_with_conditions",
    verdictNote:
      "Holding a currency is accepted. The condition is about the account itself: as soon as interest is paid on the balance, the structure becomes problematic.",
    inComparator: true,
  },
  {
    id: "spread-payments",
    name: "Spread the payments over time",
    howItWorks:
      "Instead of one large conversion, you make several smaller immediate conversions across the period. Each one remains a spot exchange.",
    whatItProtects:
      "Narrows the spread of outcomes: you are no longer betting everything on one day's rate. This is variance reduction, not a guaranteed gain.",
    limits:
      "It doesn't remove the risk, it smooths it. And more transactions can mean more fixed fees — check the per-transfer cost.",
    whatToVerify: [
      "Each conversion is genuinely immediate, with no commitment on the following ones",
      "Fixed per-transfer fees don't eat the benefit of smoothing",
    ],
    verdict: "widely_accepted",
    verdictNote:
      "A series of spot exchanges is still a series of spot exchanges. No future commitment is made.",
    inComparator: true,
  },
  {
    id: "wad",
    name: "One-sided promise to exchange",
    arabicTerm: "Wa'd",
    howItWorks:
      "One party — usually the bank — commits by promise to exchange at a set rate on a future date. The exchange itself, when it happens, is a spot exchange. You are not contractually bound.",
    whatItProtects:
      "Gives visibility close to a forward: you know the rate you will be able to convert at, without the price resting on an interest-rate differential.",
    limits:
      "Rarely available to small businesses, and usually priced on request. The margin applied can be higher than a conventional forward.",
    whatToVerify: [
      "The promise really is one-sided: a binding mutual promise (muwa'ada) is rejected by a significant number of scholars",
      "The institution has a Sharia board and follows AAOIFI standards",
      "The price carries no disguised interest component — ask how the promised rate is built",
    ],
    verdict: "debated",
    verdictNote:
      "AAOIFI standards accept the one-sided Wa'd as an alternative to conventional hedging, but some scholars remain reserved, holding that it reproduces a forward economically. This is where your advisor's view matters most.",
    inComparator: true,
  },
];

export interface AvoidItem {
  name: string;
  why: string;
}

export const SHARIA_AVOID: AvoidItem[] = [
  {
    name: "Conventional FX forward",
    why: "Its price is built directly on the interest-rate differential between the two currencies, and the exchange is deferred.",
  },
  {
    name: "Currency options",
    why: "You pay a premium for a right, with no real exchange — most scholars see gharar in this.",
  },
  {
    name: "Currency swap",
    why: "Rests on interest flows exchanged between the parties.",
  },
  {
    name: "Binding mutual promise (muwa'ada)",
    why: "When both parties are bound, the structure becomes a forward contract economically — which is exactly what the one-sided Wa'd sets out to avoid.",
  },
];

export const SHARIA_MISCONCEPTION = {
  claim: '"You can use a Salam contract to lock in an exchange rate."',
  correction:
    "Salam is a sale paid for in full upfront with deferred delivery. It is accepted for goods, but not for exchanging one currency for another: currency exchange (sarf) requires both sides to be handed over simultaneously. This confusion comes up often.",
};

export const PROVIDER_QUESTIONS = [
  "Does my account balance earn any interest or yield?",
  "Is your hedging product priced on an interest-rate differential? If so, which one?",
  "Is this a one-sided promise from you, or a mutual commitment?",
  "Do you have a Sharia board, and are your products aligned with AAOIFI standards?",
  "What is your exact margin against the interbank rate at the time of the quote?",
  "Is the exchange executed same-day, or at T+1 / T+2?",
];
