-- FX Risk & Payroll Cost Advisor — initial schema
-- No auth / single-tenant by design (see plan): RLS is intentionally left
-- disabled since there is one company profile and no login. If multi-tenant
-- auth is introduced later, enable RLS and add per-user policies here.

create extension if not exists pgcrypto;

-- Singleton company profile.
create table if not exists company (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Mon entreprise',
  base_currency text not null default 'CAD',
  sharia_mode boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country_code text not null,
  currency text not null,
  amount numeric(14, 2) not null check (amount > 0),
  frequency text not null check (frequency in ('weekly', 'biweekly', 'monthly', 'custom')),
  custom_frequency_days integer,
  type text not null check (type in ('employee', 'contractor')),
  active boolean not null default true,
  next_payment_date date,
  created_at timestamptz not null default now()
);

create index if not exists employees_active_idx on employees (active);

-- Optional: past payments, used to calibrate stats if the user fills them in.
create table if not exists payment_history (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees (id) on delete cascade,
  paid_at date not null,
  amount_source_currency numeric(14, 2) not null check (amount_source_currency > 0),
  fx_rate_used numeric(18, 8),
  fees_paid numeric(14, 2),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists payment_history_employee_idx on payment_history (employee_id);

-- Local cache of Frankfurter (ECB) daily rates, to avoid re-fetching on
-- every calculation. base/target are ISO 4217 codes.
create table if not exists fx_rates_daily (
  base text not null,
  target text not null,
  date date not null,
  rate numeric(18, 8) not null,
  primary key (base, target, date)
);

-- Cache of crypto payroll regulatory research (populated by the live
-- web-search route). checked_at drives the 30-day TTL in lib/crypto/regulatory.ts.
create table if not exists crypto_regulatory_cache (
  country_code text primary key,
  status text not null,
  risks jsonb not null default '[]'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  summary text not null,
  checked_at timestamptz not null default now(),
  origin text not null default 'baseline' check (origin in ('live', 'baseline'))
);

-- History of strategy comparisons the user actually acted on.
create table if not exists decision_log (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees (id) on delete set null,
  payment_amount numeric(14, 2) not null,
  chosen_strategy text not null,
  computed_comparison jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists decision_log_employee_idx on decision_log (employee_id);
