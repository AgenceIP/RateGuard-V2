import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

const FRANKFURTER_BASE_URL = "https://api.frankfurter.app";

export class UnsupportedCurrencyError extends Error {
  constructor(public currency: string) {
    super(`No exchange-rate data available for ${currency}.`);
    this.name = "UnsupportedCurrencyError";
  }
}

export interface RatePoint {
  date: string; // YYYY-MM-DD
  rate: number; // 1 base = `rate` target
}

let supportedCurrenciesCache: { at: number; codes: Set<string> } | null = null;
const ONE_HOUR = 60 * 60 * 1000;

/** Live list of currencies Frankfurter (ECB) actually supports — never hardcoded as if static. */
export async function getSupportedCurrencies(): Promise<Set<string>> {
  if (supportedCurrenciesCache && Date.now() - supportedCurrenciesCache.at < ONE_HOUR) {
    return supportedCurrenciesCache.codes;
  }
  const res = await fetch(`${FRANKFURTER_BASE_URL}/currencies`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    // If the metadata endpoint itself fails, don't pretend to know — let callers
    // fall through to a per-request error instead of a stale hardcoded list.
    throw new Error("Could not fetch the list of supported currencies (Frankfurter).");
  }
  const json = (await res.json()) as Record<string, string>;
  const codes = new Set(Object.keys(json));
  codes.add("EUR"); // Frankfurter's base currency, always implicitly supported
  supportedCurrenciesCache = { at: Date.now(), codes };
  return codes;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Fetches historical daily rates for base->target between start and end (inclusive), live from Frankfurter. */
export async function fetchHistoricalRates(
  base: string,
  target: string,
  start: Date,
  end: Date,
): Promise<RatePoint[]> {
  if (base === target) {
    // Trivial series — no external call needed, not a "guessed" number.
    const points: RatePoint[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      points.push({ date: toISODate(cursor), rate: 1 });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return points;
  }

  const url = `${FRANKFURTER_BASE_URL}/${toISODate(start)}..${toISODate(end)}?from=${base}&to=${target}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (res.status === 404) {
    throw new UnsupportedCurrencyError(target);
  }
  if (!res.ok) {
    throw new Error(`The Frankfurter API returned ${res.status} for ${base}->${target}.`);
  }

  const json = (await res.json()) as { rates: Record<string, Record<string, number>> };
  const points: RatePoint[] = Object.entries(json.rates)
    .filter(([, rates]) => typeof rates[target] === "number")
    .map(([date, rates]) => ({ date, rate: rates[target] }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (points.length === 0) {
    throw new UnsupportedCurrencyError(target);
  }
  return points;
}

/**
 * Returns historical rates for the last `days` days, using the Supabase cache
 * table when available to avoid re-fetching, and always filling any gap
 * live from Frankfurter. Works even without Supabase configured (supabase=null),
 * it just skips caching.
 */
export async function getHistoricalRates(
  supabase: SupabaseClient | null,
  base: string,
  target: string,
  days: number,
): Promise<RatePoint[]> {
  const end = new Date();
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - days);

  if (!supabase) {
    return fetchHistoricalRates(base, target, start, end);
  }

  const { data: cached } = await supabase
    .from("fx_rates_daily")
    .select("date, rate")
    .eq("base", base)
    .eq("target", target)
    .gte("date", toISODate(start))
    .lte("date", toISODate(end))
    .order("date", { ascending: true });

  const cachedDates = new Set((cached ?? []).map((r) => r.date as string));
  const todayISO = toISODate(end);
  const hasFreshData = cachedDates.has(todayISO) || cachedDates.has(toISODate(new Date(end.getTime() - 86400000)));

  if (cached && cached.length > 0 && hasFreshData) {
    return (cached as { date: string; rate: number }[]).map((r) => ({ date: r.date, rate: Number(r.rate) }));
  }

  const fresh = await fetchHistoricalRates(base, target, start, end);

  const rows = fresh
    .filter((p) => !cachedDates.has(p.date))
    .map((p) => ({ base, target, date: p.date, rate: p.rate }));
  if (rows.length > 0) {
    await supabase.from("fx_rates_daily").upsert(rows, { onConflict: "base,target,date" });
  }

  return fresh;
}
