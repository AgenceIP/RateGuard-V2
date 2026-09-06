# RateGuard

A Next.js app for someone with no finance background who pays employees or contractors in several countries. It
shows what an international payment really costs, and what the options are to bring that cost down — **without ever
predicting whether an exchange rate will go up or down**.

The core design rule lives in `lib/fx/stats.ts`: every risk statistic is computed from **de-meaned** historical
returns, so only the dispersion (how much a rate typically moves) is used, never a direction.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). **No configuration is needed to explore the app**: until
Supabase is connected it runs in **demo mode** with five example profiles (`lib/demo-data.ts`).

The distinction matters and the UI states it plainly: the **people, amounts and dates are invented**, but the
**exchange rates, volatility and every computed cost are real**, pulled live from the ECB via Frankfurter. The
Nigerian profile (NGN) is included on purpose: that currency isn't published by the ECB, which shows the "no
reliable data" state instead of hiding it.

## Measuring real fees instead of estimating them

This is the most useful feature in the tool. Record a few past payments (date, amount the person received, amount
debited from your account — all three are on your bank statement) and `lib/fees/effective.ts` compares each one to
the official ECB rate **for that date** to compute the margin your provider actually took.

Once that measurement exists it replaces the generic estimate in the comparator: the cost shown is no longer "about
2% in typical fees" but "what your provider actually charges you".

## Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the **SQL Editor**, run in order:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_payment_history_total_cost.sql`
   - `supabase/migrations/0003_umrah_leads.sql`
   - `supabase/seed.sql`
3. Copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API)
   - `SUPABASE_SERVICE_ROLE_KEY` (same page — **never expose it client-side**; it is only used in server code via
     `lib/supabase/server.ts`)
4. Restart `npm run dev`.

**A note on auth**: by design there is no login — a single company profile (a singleton with a fixed id) is used, so
RLS is deliberately disabled on the tables. If real multi-user auth is added later, RLS has to be enabled and
per-user policies written. The tables have no tenant column yet, so that is a real migration, not a config switch.

## Enabling live crypto research (optional)

The "Crypto" page works out of the box thanks to a pre-filled baseline (`lib/crypto/baseline.ts`, mirrored in the
database by `supabase/seed.sql`), clearly labelled as not verified live and dated.

To enable real-time web research (current regulatory status, with sources):

1. Get a key at [console.anthropic.com](https://console.anthropic.com) with access to the `web_search` tool.
2. Add `ANTHROPIC_API_KEY=...` to `.env.local`.

Results are cached for 30 days in `crypto_regulatory_cache` to avoid unnecessary calls. The cache is **global, not
per-tenant** — a country's regulatory status is the same for everyone.

## Structure

- `lib/fx/` — exchange-rate data (Frankfurter/ECB, free, no key) and risk statistics (never a direction prediction)
- `lib/fees/effective.ts` — measures the margin actually charged, from payment history
- `lib/strategies/compare.ts` — the four-strategy comparison engine (spot, forward/Wa'd, spread-out, multi-currency)
- `lib/crypto/regulatory.ts` — crypto regulatory status by country (cache + live web search)
- `lib/data/providers.ts` — payment providers, their risk tools, and the Sharia reading of each
- `lib/copy/sharia-alternatives.ts` — alternatives to a conventional forward (Wa'd, natural matching, and so on)
- `app/` — pages (dashboard, team, comparator, providers, without-a-forward guide, crypto, settings) and API routes
- `supabase/` — SQL migrations and seed data

## Verification performed

- `npm run build`, `tsc --noEmit` and `eslint` all pass
- The pure statistics and simulation logic is testable independently of Supabase (`lib/fx/stats.ts`,
  `lib/strategies/compare.ts`) — including a numeric check that spreading payments reduces dispersion relative to a
  single lump sum
- The crypto check and the strategy comparator stay explicit about the limits of their data (unsupported currency,
  insufficient history, unverified baseline) rather than inventing a number
