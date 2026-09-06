import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { getCryptoStatus } from "@/lib/crypto/regulatory";
import { countryByCode } from "@/lib/data/countries";

export async function GET(req: NextRequest) {
  const countryCode = req.nextUrl.searchParams.get("country");
  if (!countryCode) return NextResponse.json({ error: "country is required" }, { status: 400 });

  const country = countryByCode(countryCode);
  if (!country) return NextResponse.json({ error: "Unknown country" }, { status: 400 });

  const supabase = getServerSupabaseClient();
  const status = await getCryptoStatus(supabase, countryCode, country.name);

  if (!status) {
    return NextResponse.json(
      { error: "No data available for this country — nothing cached, and no live search (missing Anthropic key, or the search failed)." },
      { status: 404 },
    );
  }

  return NextResponse.json(status);
}
