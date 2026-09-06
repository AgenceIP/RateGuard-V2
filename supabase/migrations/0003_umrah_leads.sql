-- Leads captured from the /umrah landing page: guide downloads and OFX
-- account-link requests. Single-tenant, no auth — same RLS stance as
-- 0001_init.sql.

create table if not exists umrah_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  agency_name text,
  origin_country text,
  pilgrims integer,
  sar_per_pilgrim numeric(14, 2),
  compliance_preference text check (compliance_preference in ('conventional', 'shariah')),
  wants_ofx_link boolean not null default false,
  source text not null default 'guide_download' check (source in ('guide_download', 'ofx_link_request')),
  created_at timestamptz not null default now()
);

create index if not exists umrah_leads_email_idx on umrah_leads (email);
