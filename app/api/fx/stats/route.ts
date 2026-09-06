import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { getHistoricalRates, getSupportedCurrencies, UnsupportedCurrencyError } from "@/lib/fx/frankfurter";
import { computeCurrencyRiskStats } from "@/lib/fx/stats";

export async function GET(req: NextRequest) {
  const currency = req.nextUrl.searchParams.get("currency");
  const base = req.nextUrl.searchParams.get("base") ?? "CAD";
  const frequencyDays = Number(req.nextUrl.searchParams.get("frequencyDays") ?? "14");

  if (!currency) return NextResponse.json({ error: "currency is required" }, { status: 400 });

  try {
    const supported = await getSupportedCurrencies();
    if (!supported.has(currency) || !supported.has(base)) {
      return NextResponse.json(
        { dataAvailable: false, error: `No data available for ${currency} via Frankfurter/ECB.` },
        { status: 200 },
      );
    }

    const supabase = getServerSupabaseClient();
    const series = await getHistoricalRates(supabase, base, currency, 400);
    const stats = computeCurrencyRiskStats(currency, series, frequencyDays);

    // Don't ship the raw daily-returns array over the wire — it's an internal
    // simulation input, not something a client needs to render.
    const { demeanedDailyReturns: _omit, ...publicStats } = stats;
    void _omit;

    return NextResponse.json(publicStats);
  } catch (err) {
    if (err instanceof UnsupportedCurrencyError) {
      return NextResponse.json({ dataAvailable: false, error: err.message }, { status: 200 });
    }
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
