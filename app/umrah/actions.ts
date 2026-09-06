"use server";

import { z } from "zod";
import { getServerSupabaseClient } from "@/lib/supabase/server";

const leadSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  agencyName: z.string().nullable().optional(),
  originCountry: z.string().nullable().optional(),
  pilgrims: z.number().nullable().optional(),
  sarPerPilgrim: z.number().nullable().optional(),
  compliancePreference: z.enum(["conventional", "shariah"]).nullable().optional(),
  source: z.enum(["guide_download", "ofx_link_request"]),
});

export type UmrahLeadInput = z.infer<typeof leadSchema>;

/**
 * Best-effort lead capture: the guide/OFX request must still work as a demo
 * even when Supabase isn't connected, so a failed insert is logged and
 * swallowed rather than blocking the download or the request confirmation.
 */
export async function submitUmrahLead(input: UmrahLeadInput): Promise<{ error?: string }> {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid form." };

  const supabase = getServerSupabaseClient();
  if (!supabase) return {};

  const { error } = await supabase.from("umrah_leads").insert({
    email: parsed.data.email,
    agency_name: parsed.data.agencyName ?? null,
    origin_country: parsed.data.originCountry ?? null,
    pilgrims: parsed.data.pilgrims ?? null,
    sar_per_pilgrim: parsed.data.sarPerPilgrim ?? null,
    compliance_preference: parsed.data.compliancePreference ?? null,
    wants_ofx_link: parsed.data.source === "ofx_link_request",
    source: parsed.data.source,
  });

  if (error) console.error("submitUmrahLead insert failed:", error.message);
  return {};
}
