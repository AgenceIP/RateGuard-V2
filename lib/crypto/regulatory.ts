import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CryptoRegulatoryStatus } from "@/lib/types";
import { getBaselineCryptoStatus } from "./baseline";

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface ResearchedStatus {
  status: string;
  risks: string[];
  sources: { label: string; url: string | null }[];
  summary: string;
}

function extractJson(text: string): ResearchedStatus | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    if (typeof parsed.status === "string" && typeof parsed.summary === "string") {
      return {
        status: parsed.status,
        risks: Array.isArray(parsed.risks) ? parsed.risks.filter((r: unknown) => typeof r === "string") : [],
        sources: Array.isArray(parsed.sources)
          ? parsed.sources
              .filter((s: unknown) => s && typeof s === "object")
              .map((s: { label?: unknown; url?: unknown }) => ({
                label: typeof s.label === "string" ? s.label : "Source",
                url: typeof s.url === "string" ? s.url : null,
              }))
          : [],
        summary: parsed.summary,
      };
    }
  } catch {
    return null;
  }
  return null;
}

/** Live web-search research via the Anthropic API's `web_search` tool. Requires ANTHROPIC_API_KEY with web search enabled. */
export async function researchCryptoStatus(countryCode: string, countryName: string): Promise<ResearchedStatus> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured.");

  const anthropic = new Anthropic({ apiKey });

  const today = new Date().toISOString().slice(0, 10);

  const message = await anthropic.messages.create({
    model: "claude-opus-5",
    // Thinking is on by default on this model and counts toward max_tokens,
    // so leave headroom. Effort is capped at medium because this is a bounded
    // factual lookup, not a hard reasoning task — it keeps the job cheap.
    max_tokens: 8000,
    output_config: { effort: "medium" },
    // `_20260209` is the current web search variant (dynamic filtering). The
    // cast covers SDK versions whose types predate it.
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 4 } as never],
    messages: [
      {
        role: "user",
        content: `Research the CURRENT regulatory status (today is ${today}) of paying salary in cryptocurrency to an employee or contractor in ${countryName} (code ${countryCode}). Look for official or otherwise reliable, recent sources.

Reply with a JSON object ONLY (nothing else, no text before or after) in exactly this shape:
{
  "status": "a short sentence summarising the general regulatory status (not legal advice)",
  "risks": ["main risk 1", "main risk 2", "..."],
  "sources": [{"label": "source name", "url": "https://..."}],
  "summary": "a 2-3 sentence summary in plain English, no legal jargon"
}`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  const parsed = textBlock && "text" in textBlock ? extractJson(textBlock.text) : null;

  if (!parsed) {
    throw new Error("Unstructured search response — worth retrying.");
  }
  return parsed;
}

export async function getCryptoStatus(
  supabase: SupabaseClient | null,
  countryCode: string,
  countryName: string,
): Promise<CryptoRegulatoryStatus | null> {
  let cached: {
    country_code: string;
    status: string;
    risks: string[];
    sources: { label: string; url: string | null }[];
    summary: string;
    checked_at: string;
    origin: string;
  } | null = null;

  if (supabase) {
    const { data } = await supabase
      .from("crypto_regulatory_cache")
      .select("*")
      .eq("country_code", countryCode)
      .maybeSingle();
    cached = data;
  }

  const isFresh = cached ? Date.now() - new Date(cached.checked_at).getTime() < CACHE_TTL_MS : false;

  if (cached && isFresh) {
    return { ...cached, origin: "cache-fresh" } as CryptoRegulatoryStatus;
  }

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const researched = await researchCryptoStatus(countryCode, countryName);
      const checkedAt = new Date().toISOString();

      if (supabase) {
        await supabase.from("crypto_regulatory_cache").upsert({
          country_code: countryCode,
          status: researched.status,
          risks: researched.risks,
          sources: researched.sources,
          summary: researched.summary,
          checked_at: checkedAt,
          origin: "live",
        });
      }

      return {
        country_code: countryCode,
        status: researched.status,
        risks: researched.risks,
        sources: researched.sources,
        summary: researched.summary,
        checked_at: checkedAt,
        origin: "live",
      };
    } catch {
      // Fall through to whatever cache we have, even if stale.
    }
  }

  if (cached) {
    return { ...cached, origin: "cache-stale" } as CryptoRegulatoryStatus;
  }

  // Last resort: the in-code baseline, so the feature still says something
  // useful without Supabase or an API key — clearly flagged as unverified.
  return getBaselineCryptoStatus(countryCode);
}
